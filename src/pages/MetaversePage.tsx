import { useEffect, useState } from 'react';
import { nftsService } from '../services/nfts';
import { NFTWithDetails } from '../types';
import { authService } from '../services/auth';
import { metaverseService, MetaverseSession, ChatMessage } from '../services/metaverse';
import MetaverseScene from '../components/MetaverseScene';
import MetaverseChat from '../components/MetaverseChat';
import NFTTradeModal from '../components/NFTTradeModal';
import { Users } from 'lucide-react';

export default function MetaversePage() {
  const [nfts, setNfts] = useState<NFTWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [characterType, setCharacterType] = useState('관우');
  const [characterColor, setCharacterColor] = useState('#8B0000');
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState('initializing');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [onlineSessions, setOnlineSessions] = useState<MetaverseSession[]>([]);
  const [showTradeModal, setShowTradeModal] = useState(false);
  const [selectedNFT, setSelectedNFT] = useState<NFTWithDetails | null>(null);
  const [show3D, setShow3D] = useState(false);
  const [userChatMessages, setUserChatMessages] = useState<Map<string, { message: string; timestamp: number }>>(new Map());
  const [myCurrentChat, setMyCurrentChat] = useState('');
  const [myChatTimestamp, setMyChatTimestamp] = useState(0);

  useEffect(() => {
    console.log('=== MetaversePage mounted ===');
    setStep('mounted');
    loadData();
  }, []);

  const loadData = async () => {
    console.log('Step 1: Starting to load data...');
    setStep('loading data');

    try {
      setError(null);
      setLoading(true);

      console.log('Step 2: Getting current user...');
      const user = await authService.getCurrentUser();
      console.log('Current user:', user?.id);
      setCurrentUser(user);
      setStep('user loaded');

      if (user) {
        try {
          console.log('Step 3: Getting character selection...');
          const character = await authService.getCharacterSelection(user.id);
          console.log('Character data:', character);
          if (character) {
            setCharacterType(character.character_type);
            setCharacterColor(character.character_color);
          }
          setStep('character loaded');

          console.log('Step 3.5: Joining metaverse...');
          await metaverseService.joinMetaverse(
            user.id,
            character?.character_color || '#8B0000',
            character?.character_type || '관우'
          );

          const sessions = await metaverseService.getActiveSessions();
          setOnlineSessions(sessions);

          metaverseService.subscribeToSessions(
            (session) => {
              setOnlineSessions((prev) => {
                const index = prev.findIndex((s) => s.user_id === session.user_id);
                if (index >= 0) {
                  const updated = [...prev];
                  updated[index] = session;
                  return updated;
                } else {
                  return [...prev, session];
                }
              });
            },
            (sessionId) => {
              setOnlineSessions((prev) => prev.filter((s) => s.id !== sessionId));
            }
          );

          metaverseService.subscribeToChat((message: ChatMessage) => {
            console.log('=== CHAT MESSAGE RECEIVED ===');
            console.log('Message:', message);
            console.log('My user ID:', user.id);
            console.log('Sender ID:', message.user_id);
            console.log('Is mine?', message.user_id === user.id);

            const timestamp = Date.now();

            // 내가 보낸 메시지인 경우
            if (message.user_id === user.id) {
              console.log('Setting MY chat:', message.message, 'at', timestamp);
              setMyCurrentChat(message.message);
              setMyChatTimestamp(timestamp);

              setTimeout(() => {
                console.log('Clearing MY chat');
                setMyCurrentChat('');
                setMyChatTimestamp(0);
              }, 5000);
            } else {
              // 다른 사람이 보낸 메시지
              console.log('Setting OTHER user chat:', message.user_id, message.message);
              setUserChatMessages((prev) => {
                const updated = new Map(prev);
                updated.set(message.user_id, {
                  message: message.message,
                  timestamp: timestamp
                });
                console.log('Updated userChatMessages:', updated);
                return updated;
              });

              setTimeout(() => {
                setUserChatMessages((prev) => {
                  const updated = new Map(prev);
                  updated.delete(message.user_id);
                  return updated;
                });
              }, 5000);
            }
          });
        } catch (charError) {
          console.warn('Character not found, using default:', charError);
        }
      }

      console.log('Step 4: Getting NFTs...');
      const data = await nftsService.getMyNFTs();
      console.log('NFTs loaded:', data?.length || 0);
      setNfts(data || []);
      setStep('nfts loaded');

    } catch (error) {
      console.error('Failed to load data:', error);
      setError(String(error));
      setStep('error');
    } finally {
      setLoading(false);
      console.log('Step 5: Loading complete');
      setStep('complete');
    }
  };

  useEffect(() => {
    return () => {
      if (currentUser) {
        metaverseService.leaveMetaverse(currentUser.id).catch(console.error);
      }
    };
  }, [currentUser]);

  const handleOpenTrade = (nft: NFTWithDetails) => {
    setSelectedNFT(nft);
    setShowTradeModal(true);
  };

  console.log('Current render - Loading:', loading, 'Step:', step, 'NFTs:', nfts.length, 'Error:', error);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-red-900 via-amber-800 to-green-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-yellow-500 mx-auto mb-4"></div>
          <p className="text-white text-xl font-bold">메타버스 입장중...</p>
          <p className="text-amber-200 text-sm mt-2">삼국지 갤러리로 이동합니다</p>
          <p className="text-amber-300 text-xs mt-4">현재 단계: {step}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-red-900 via-amber-800 to-green-900">
        <div className="text-center bg-red-900 p-8 rounded-lg border-2 border-yellow-500 max-w-2xl">
          <p className="text-white text-xl font-bold mb-4">에러 발생</p>
          <p className="text-amber-200 text-sm mb-4">{error}</p>
          <p className="text-amber-300 text-xs mb-4">단계: {step}</p>
          <button
            onClick={() => {
              setLoading(true);
              loadData();
            }}
            className="px-6 py-2 bg-yellow-500 text-red-900 rounded-lg hover:bg-yellow-400 transition font-bold"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  if (show3D && nfts.length > 0) {
    console.log('=== RENDERING 3D SCENE ===');
    console.log('My chat:', myCurrentChat);
    console.log('My chat timestamp:', myChatTimestamp);
    console.log('Time since message:', myChatTimestamp ? Date.now() - myChatTimestamp : 'N/A');
    console.log('User chat messages:', userChatMessages);

    const playerData = onlineSessions.map(session => {
      const chatData = userChatMessages.get(session.user_id);
      return {
        id: session.user_id,
        position: [session.position_x, session.position_y, session.position_z] as [number, number, number],
        color: session.character_color,
        name: session.character_type,
        characterType: session.character_type,
        chatMessage: chatData?.message,
        chatTimestamp: chatData?.timestamp
      };
    });

    return (
      <>
        <MetaverseScene
          nfts={nfts}
          characterType={characterType}
          characterColor={characterColor}
          onlineUsers={playerData}
          currentUserId={currentUser?.id}
          myChat={myCurrentChat}
          myChatTimestamp={myChatTimestamp}
        />
        {currentUser && <MetaverseChat userId={currentUser.id} />}
        <button
          onClick={() => setShow3D(false)}
          className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-500 transition font-bold z-50"
        >
          메타버스 나가기
        </button>
        {showTradeModal && selectedNFT && currentUser && (
          <NFTTradeModal
            nft={selectedNFT}
            customerId={currentUser.id}
            onClose={() => setShowTradeModal(false)}
            onSuccess={() => loadData()}
          />
        )}
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-900 via-amber-800 to-green-900">
      <div className="container mx-auto px-4 py-8">
        <div className="bg-gradient-to-br from-red-900 to-red-800 text-white rounded-lg p-8 shadow-2xl border-2 border-yellow-500">
          <h1 className="text-4xl font-bold text-yellow-400 mb-6 text-center">
            ⚔️ KAUS 삼국지 메타버스
          </h1>

          <div className="bg-black/30 rounded-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-yellow-300">메타버스 현황</h2>
              <div className="flex items-center gap-2 text-green-400">
                <Users size={20} />
                <span className="font-bold">{onlineSessions.length}명 접속 중</span>
              </div>
            </div>
            <div className="space-y-2 text-amber-100">
              <p>✅ 선택한 캐릭터: {characterType}</p>
              <p>✅ 보유 NFT: {nfts.length}개</p>
              <p>✅ 실시간 채팅 활성화</p>
              <p>✅ 멀티플레이어 지원</p>
            </div>
          </div>

          {nfts.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">⚔️</div>
              <h2 className="text-3xl font-bold text-yellow-400 mb-4">갤러리가 비어있습니다</h2>
              <p className="text-amber-100 mb-6 text-lg">
                아직 보유한 KAUS NFT 인증서가 없습니다.<br />
                제품을 구매하고 메타버스 갤러리를 채워보세요!
              </p>
              <a
                href="/products"
                className="inline-block px-8 py-4 bg-yellow-500 text-red-900 rounded-lg hover:bg-yellow-400 transition font-bold text-lg shadow-lg"
              >
                🛒 제품 구매하러 가기
              </a>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-yellow-300">보유 중인 NFT</h2>
                <button
                  onClick={() => setShow3D(true)}
                  className="px-6 py-3 bg-yellow-500 text-red-900 rounded-lg hover:bg-yellow-400 transition font-bold text-lg shadow-lg animate-pulse"
                >
                  🌐 3D 메타버스 입장하기
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {nfts.map((nft) => (
                  <div key={nft.id} className="bg-black/30 rounded-lg p-4">
                    <h3 className="text-lg font-bold text-yellow-400 mb-2">
                      {nft.product?.name || 'KAUS NFT'}
                    </h3>
                    <div className="space-y-1 text-sm text-amber-100 mb-3">
                      <p>브랜드: {nft.product?.brand || 'N/A'}</p>
                      <p>NFT ID: {nft.nft_id.slice(0, 16)}...</p>
                      <p>발행일: {new Date(nft.minted_at).toLocaleDateString('ko-KR')}</p>
                    </div>
                    <button
                      onClick={() => handleOpenTrade(nft)}
                      className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-500 transition text-sm font-bold"
                    >
                      거래 등록
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-8 pt-8 border-t border-yellow-600">
            <p className="text-center text-amber-200 text-sm">
              ✨ 완전한 3D 메타버스 경험을 즐기세요! ✨
            </p>
            <p className="text-center text-amber-300 text-xs mt-2">
              실시간 채팅, 멀티플레이어, NFT 거래 지원
            </p>
          </div>
        </div>
      </div>

      {showTradeModal && selectedNFT && currentUser && (
        <NFTTradeModal
          nft={selectedNFT}
          customerId={currentUser.id}
          onClose={() => setShowTradeModal(false)}
          onSuccess={() => loadData()}
        />
      )}
    </div>
  );
}
