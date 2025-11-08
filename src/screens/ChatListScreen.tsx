import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { collection, query, where, getDocs, doc, getDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Chat, User } from '../types';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';

type ChatListScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const ChatListScreen = () => {
  const { user } = useAuth();
  const navigation = useNavigation<ChatListScreenNavigationProp>();
  const [chats, setChats] = useState<(Chat & { otherUser?: User })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    // Listen for chats in real-time
    const chatsRef = collection(db, 'chats');
    const q = query(
      chatsRef,
      where(user.role === 'tenant' ? 'tenantId' : 'landlordId', '==', user.id)
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const chatsData = await Promise.all(
        snapshot.docs.map(async (docSnapshot) => {
          const chatData = {
            id: docSnapshot.id,
            ...docSnapshot.data(),
            lastMessageTime: docSnapshot.data().lastMessageTime?.toDate(),
          } as Chat;

          const otherUserId = user.role === 'tenant' ? chatData.landlordId : chatData.tenantId;
          const otherUserDoc = await getDoc(doc(db, 'users', otherUserId));

          return {
            ...chatData,
            otherUser: otherUserDoc.exists()
              ? ({ id: otherUserDoc.id, ...otherUserDoc.data() } as User)
              : undefined,
          };
        })
      );

      setChats(chatsData.sort((a, b) => {
        if (!a.lastMessageTime || !b.lastMessageTime) return 0;
        return b.lastMessageTime.getTime() - a.lastMessageTime.getTime();
      }));
      setLoading(false);
    });

    return unsubscribe;
  }, [user]);

  const renderChat = ({ item }: { item: Chat & { otherUser?: User } }) => (
    <TouchableOpacity
      style={styles.chatCard}
      onPress={() => {
        navigation.navigate('Chat', {
          matchId: item.matchId,
          recipientName: item.otherUser?.name || 'Unknown',
        });
      }}
    >
      {item.otherUser?.avatarUrl && (
        <Image source={{ uri: item.otherUser.avatarUrl }} style={styles.avatar} />
      )}
      <View style={styles.chatInfo}>
        <Text style={styles.chatName}>{item.otherUser?.name || 'Unknown'}</Text>
        {item.lastMessage && (
          <Text style={styles.lastMessage} numberOfLines={1}>
            {item.lastMessage.text}
          </Text>
        )}
      </View>
      {item.unreadCount && item.unreadCount[user?.id || ''] > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{item.unreadCount[user?.id || '']}</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#1A73E8" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={chats}
        renderItem={renderChat}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No messages yet. Start a conversation!</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    padding: 15,
  },
  chatCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#ddd',
    marginRight: 15,
  },
  chatInfo: {
    flex: 1,
  },
  chatName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  lastMessage: {
    fontSize: 14,
    color: '#666',
  },
  badge: {
    backgroundColor: '#1A73E8',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  empty: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
});

export default ChatListScreen;

