import { NextRequest, NextResponse } from 'next/server'
import { doc, getDoc, updateDoc, serverTimestamp, Timestamp } from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'
import { db, storage } from '@/lib/firebase/config'
import { Document, SeriosityBreakdown } from '@/lib/firebase/types'

// POST - Upload document
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tenantId = params.id
    const formData = await request.formData()
    const file = formData.get('file') as File
    const documentType = formData.get('document_type') as 'income_proof' | 'reference'

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided', code: 'validation/missing-field' },
        { status: 400 }
      )
    }

    if (!documentType || !['income_proof', 'reference'].includes(documentType)) {
      return NextResponse.json(
        { error: 'Invalid document type', code: 'validation/invalid-input' },
        { status: 400 }
      )
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size must be less than 10MB', code: 'validation/file-too-large' },
        { status: 400 }
      )
    }

    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Only PDF and image files are allowed', code: 'validation/invalid-file-type' },
        { status: 400 }
      )
    }

    // Get tenant profile
    const tenantRef = doc(db, 'tenantProfiles', tenantId)
    const tenantSnap = await getDoc(tenantRef)

    if (!tenantSnap.exists()) {
      return NextResponse.json(
        { error: 'Tenant profile not found', code: 'resource/not-found' },
        { status: 404 }
      )
    }

    const tenantData = tenantSnap.data()

    // Upload file to Firebase Storage
    const timestamp = Date.now()
    const fileName = `${tenantId}/${documentType}/${timestamp}_${file.name}`
    const storageRef = ref(storage, `documents/${fileName}`)
    
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    
    await uploadBytes(storageRef, buffer, {
      contentType: file.type,
    })

    const downloadURL = await getDownloadURL(storageRef)

    // Create document object
    const newDocument: Document = {
      url: downloadURL,
      uploaded_at: Timestamp.now(),
      verified: false, // Will be verified manually or by admin
    }

    // Update tenant profile with new document
    const currentDocuments = tenantData.documents || {}
    const documentArray = currentDocuments[documentType] || []
    documentArray.push(newDocument)

    const updatedDocuments = {
      ...currentDocuments,
      [documentType]: documentArray,
    }

    // Calculate updated Seriosity Score
    const currentBreakdown = tenantData.seriosity_breakdown || {
      id_verified: 0,
      income_proof: 0,
      interview_clarity: 0,
      response_consistency: 0,
      responsiveness: 0,
      references: 0,
    }

    let newBreakdown = { ...currentBreakdown }
    
    // Update score based on document type
    if (documentType === 'income_proof') {
      // Award points for income proof (up to 25 points)
      // For now, give 15 points for first document, 10 for additional
      const incomeProofCount = documentArray.length
      if (incomeProofCount === 1) {
        newBreakdown.income_proof = 15
      } else if (incomeProofCount >= 2) {
        newBreakdown.income_proof = 25
      }
    } else if (documentType === 'reference') {
      // Award points for references (5 points each, up to 10 points)
      const referenceCount = documentArray.length
      newBreakdown.references = Math.min(10, referenceCount * 5)
    }

    // Calculate total score
    const totalScore = (Object.values(newBreakdown) as number[]).reduce((sum, val) => sum + val, 0)

    // Update Firestore
    await updateDoc(tenantRef, {
      documents: updatedDocuments,
      seriosity_score: totalScore,
      seriosity_breakdown: newBreakdown,
      updated_at: serverTimestamp(),
    })

    return NextResponse.json({
      success: true,
      document: newDocument,
      seriosity_score: totalScore,
      seriosity_breakdown: newBreakdown,
    })
  } catch (error: any) {
    console.error('Error uploading document:', error)
    return NextResponse.json(
      { 
        error: 'Failed to upload document', 
        message: error.message,
        code: 'internal/error' 
      },
      { status: 500 }
    )
  }
}

// DELETE - Remove document
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tenantId = params.id
    const body = await request.json()
    const { document_url, document_type } = body

    if (!document_url || !document_type) {
      return NextResponse.json(
        { error: 'Missing required fields', code: 'validation/missing-field' },
        { status: 400 }
      )
    }

    // Get tenant profile
    const tenantRef = doc(db, 'tenantProfiles', tenantId)
    const tenantSnap = await getDoc(tenantRef)

    if (!tenantSnap.exists()) {
      return NextResponse.json(
        { error: 'Tenant profile not found', code: 'resource/not-found' },
        { status: 404 }
      )
    }

    const tenantData = tenantSnap.data()
    const currentDocuments = tenantData.documents || {}
    const documentArray = currentDocuments[document_type] || []

    // Find and remove the document
    const updatedArray = documentArray.filter((doc: Document) => doc.url !== document_url)

    if (updatedArray.length === documentArray.length) {
      return NextResponse.json(
        { error: 'Document not found', code: 'resource/not-found' },
        { status: 404 }
      )
    }

    // Delete from Firebase Storage
    try {
      const storageRef = ref(storage, document_url)
      await deleteObject(storageRef)
    } catch (storageError) {
      console.error('Error deleting from storage:', storageError)
      // Continue even if storage deletion fails
    }

    // Update documents
    const updatedDocuments = {
      ...currentDocuments,
      [document_type]: updatedArray,
    }

    // Recalculate Seriosity Score
    const currentBreakdown = tenantData.seriosity_breakdown || {
      id_verified: 0,
      income_proof: 0,
      interview_clarity: 0,
      response_consistency: 0,
      responsiveness: 0,
      references: 0,
    }

    let newBreakdown = { ...currentBreakdown }

    if (document_type === 'income_proof') {
      const incomeProofCount = updatedArray.length
      if (incomeProofCount === 0) {
        newBreakdown.income_proof = 0
      } else if (incomeProofCount === 1) {
        newBreakdown.income_proof = 15
      } else {
        newBreakdown.income_proof = 25
      }
    } else if (document_type === 'reference') {
      const referenceCount = updatedArray.length
      newBreakdown.references = Math.min(10, referenceCount * 5)
    }

    const totalScore = (Object.values(newBreakdown) as number[]).reduce((sum, val) => sum + val, 0)

    // Update Firestore
    await updateDoc(tenantRef, {
      documents: updatedDocuments,
      seriosity_score: totalScore,
      seriosity_breakdown: newBreakdown,
      updated_at: serverTimestamp(),
    })

    return NextResponse.json({
      success: true,
      seriosity_score: totalScore,
      seriosity_breakdown: newBreakdown,
    })
  } catch (error: any) {
    console.error('Error deleting document:', error)
    return NextResponse.json(
      { 
        error: 'Failed to delete document', 
        message: error.message,
        code: 'internal/error' 
      },
      { status: 500 }
    )
  }
}
