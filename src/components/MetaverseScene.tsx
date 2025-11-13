import { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Box, Sphere, Environment } from '@react-three/drei';
import { NFTWithDetails } from '../types';
import * as THREE from 'three';

interface PlayerData {
  id: string;
  position: [number, number, number];
  color: string;
  name: string;
  characterType: string;
  chatMessage?: string;
  chatTimestamp?: number;
}

interface MetaverseSceneProps {
  nfts: NFTWithDetails[];
  characterType: string;
  characterColor: string;
  onlineUsers?: PlayerData[];
  currentUserId?: string;
  myChat?: string;
  myChatTimestamp?: number;
}

function Character({
  position,
  color,
  isPlayer = false,
  name = '',
  characterType = '관우',
  chatMessage = '',
  chatTimestamp = 0
}: {
  position: [number, number, number];
  color: string;
  isPlayer?: boolean;
  name?: string;
  characterType?: string;
  chatMessage?: string;
  chatTimestamp?: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const weaponRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current && isPlayer) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 2) * 0.1;
    }
    if (weaponRef.current) {
      weaponRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 1.5) * 0.2;
    }
  });

  const getCharacterFeatures = () => {
    switch (characterType) {
      case '관우':
        return {
          headColor: '#8B4513',
          beardColor: '#2C1810',
          weaponColor: '#C0C0C0',
          height: 1.2,
          hasBeard: true,
          hasWeapon: true,
          weaponType: 'spear'
        };
      case '조조':
        return {
          headColor: '#F4E4C1',
          beardColor: '#1a1a1a',
          weaponColor: '#FFD700',
          height: 1.0,
          hasBeard: true,
          hasWeapon: true,
          weaponType: 'sword'
        };
      case '유비':
        return {
          headColor: '#F4E4C1',
          beardColor: '#4a2511',
          weaponColor: '#C0C0C0',
          height: 1.0,
          hasBeard: true,
          hasWeapon: true,
          weaponType: 'sword'
        };
      case '제갈량':
        return {
          headColor: '#F4E4C1',
          beardColor: '#1a1a1a',
          weaponColor: '#FFFFFF',
          height: 1.1,
          hasBeard: true,
          hasWeapon: true,
          weaponType: 'fan'
        };
      case '여포':
        return {
          headColor: '#D4A574',
          beardColor: '#2C1810',
          weaponColor: '#8B0000',
          height: 1.3,
          hasBeard: false,
          hasWeapon: true,
          weaponType: 'halberd'
        };
      default:
        return {
          headColor: '#F4E4C1',
          beardColor: '#2C1810',
          weaponColor: '#C0C0C0',
          height: 1.0,
          hasBeard: true,
          hasWeapon: true,
          weaponType: 'sword'
        };
    }
  };

  const features = getCharacterFeatures();

  return (
    <group position={position}>
      <Sphere ref={meshRef} args={[0.5, 32, 32]} position={[0, 0.5, 0]}>
        <meshStandardMaterial color={features.headColor} metalness={0.2} roughness={0.6} />
      </Sphere>

      {features.hasBeard && (
        <Box args={[0.4, 0.6, 0.2]} position={[0, 0, 0.35]} rotation={[0.3, 0, 0]}>
          <meshStandardMaterial color={features.beardColor} metalness={0.1} roughness={0.8} />
        </Box>
      )}

      <Box args={[0.7, features.height, 0.5]} position={[0, -0.3 - features.height / 2, 0]}>
        <meshStandardMaterial color={color} metalness={0.3} roughness={0.4} />
      </Box>

      <Box args={[0.2, 0.8, 0.2]} position={[-0.5, -0.3, 0]}>
        <meshStandardMaterial color={features.headColor} metalness={0.2} roughness={0.6} />
      </Box>
      <Box args={[0.2, 0.8, 0.2]} position={[0.5, -0.3, 0]}>
        <meshStandardMaterial color={features.headColor} metalness={0.2} roughness={0.6} />
      </Box>

      {features.hasWeapon && features.weaponType === 'spear' && (
        <group ref={weaponRef} position={[0.8, -0.2, 0]}>
          <Box args={[0.1, 2.5, 0.1]}>
            <meshStandardMaterial color="#8B4513" metalness={0.3} roughness={0.7} />
          </Box>
          <Box args={[0.15, 0.6, 0.05]} position={[0, 1.5, 0]}>
            <meshStandardMaterial color={features.weaponColor} metalness={0.8} roughness={0.2} />
          </Box>
        </group>
      )}

      {features.hasWeapon && features.weaponType === 'sword' && (
        <group ref={weaponRef} position={[0.6, -0.5, 0]} rotation={[0, 0, -0.5]}>
          <Box args={[0.1, 1.2, 0.05]}>
            <meshStandardMaterial color={features.weaponColor} metalness={0.8} roughness={0.2} />
          </Box>
          <Box args={[0.15, 0.2, 0.08]} position={[0, -0.7, 0]}>
            <meshStandardMaterial color="#8B4513" metalness={0.3} roughness={0.7} />
          </Box>
        </group>
      )}

      {features.hasWeapon && features.weaponType === 'fan' && (
        <group ref={weaponRef} position={[0.6, -0.2, 0]} rotation={[0, 0, -0.3]}>
          <Box args={[0.05, 0.8, 0.01]}>
            <meshStandardMaterial color="#8B4513" metalness={0.3} roughness={0.7} />
          </Box>
          <Box args={[0.02, 0.6, 0.4]} position={[0, 0.3, 0]}>
            <meshStandardMaterial color={features.weaponColor} metalness={0.1} roughness={0.8} />
          </Box>
        </group>
      )}

      {features.hasWeapon && features.weaponType === 'halberd' && (
        <group ref={weaponRef} position={[0.8, -0.2, 0]}>
          <Box args={[0.12, 2.8, 0.12]}>
            <meshStandardMaterial color="#4a2511" metalness={0.3} roughness={0.7} />
          </Box>
          <Box args={[0.2, 0.8, 0.1]} position={[0.1, 1.6, 0]}>
            <meshStandardMaterial color={features.weaponColor} metalness={0.8} roughness={0.2} />
          </Box>
        </group>
      )}

      {name && (
        <Text
          position={[0, features.height + 1.2, 0]}
          fontSize={0.3}
          color="#FFD700"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.05}
          outlineColor="black"
        >
          {name}
        </Text>
      )}

      {(() => {
        const shouldShow = chatMessage && chatTimestamp && (Date.now() - chatTimestamp < 5000);
        if (shouldShow) {
          console.log('Showing chat bubble:', { name, chatMessage, chatTimestamp, age: Date.now() - chatTimestamp });
        }
        return shouldShow ? (
          <group position={[0, features.height + 2, 0]}>
            <Box args={[Math.min(chatMessage.length * 0.15 + 0.5, 4), 0.6, 0.1]} position={[0, 0, 0]}>
              <meshStandardMaterial color="#ffffff" opacity={0.95} transparent />
            </Box>
            <Text
              position={[0, 0, 0.06]}
              fontSize={0.2}
              color="#000000"
              anchorX="center"
              anchorY="middle"
              maxWidth={3.5}
            >
              {chatMessage}
            </Text>
            <mesh position={[0, -0.4, 0]} rotation={[0, 0, 0]}>
              <coneGeometry args={[0.15, 0.2, 3]} />
              <meshStandardMaterial color="#ffffff" opacity={0.95} transparent />
            </mesh>
          </group>
        ) : null;
      })()}
    </group>
  );
}

function NFTDisplay({
  nft,
  position,
  onClick
}: {
  nft: NFTWithDetails;
  position: [number, number, number];
  onClick: () => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
      if (hovered) {
        meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 3) * 0.1;
      }
    }
  });

  useEffect(() => {
    document.body.style.cursor = hovered ? 'pointer' : 'auto';
    return () => {
      document.body.style.cursor = 'auto';
    };
  }, [hovered]);

  return (
    <group position={position}>
      <Box
        ref={meshRef}
        args={[1.5, 2, 0.1]}
        onClick={onClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <meshStandardMaterial
          color={hovered ? "#fbbf24" : "#ffffff"}
          metalness={0.6}
          roughness={0.2}
          emissive={hovered ? "#fbbf24" : "#000000"}
          emissiveIntensity={hovered ? 0.3 : 0}
        />
      </Box>
      <Text
        position={[0, 1.3, 0.1]}
        fontSize={0.2}
        color="#1f2937"
        anchorX="center"
        anchorY="middle"
        maxWidth={1.3}
      >
        {nft.product?.name || 'KAUS NFT'}
      </Text>
      <Text
        position={[0, 1, 0.1]}
        fontSize={0.15}
        color="#4b5563"
        anchorX="center"
        anchorY="middle"
      >
        {nft.product?.brand || 'Luxury Brand'}
      </Text>
      <Text
        position={[0, -1.2, 0.1]}
        fontSize={0.12}
        color="#6b7280"
        anchorX="center"
        anchorY="middle"
        maxWidth={1.3}
      >
        ID: {nft.nft_id.slice(0, 8)}...
      </Text>
    </group>
  );
}

function Floor() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]} receiveShadow>
      <planeGeometry args={[50, 50]} />
      <meshStandardMaterial color="#2d1810" metalness={0.1} roughness={0.8} />
    </mesh>
  );
}

function Walls() {
  return (
    <>
      <mesh position={[0, 5, -15]} receiveShadow>
        <planeGeometry args={[50, 12]} />
        <meshStandardMaterial color="#4a2618" side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[-15, 5, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[30, 12]} />
        <meshStandardMaterial color="#3d1f14" side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[15, 5, 0]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[30, 12]} />
        <meshStandardMaterial color="#3d1f14" side={THREE.DoubleSide} />
      </mesh>
    </>
  );
}

function Scene({
  nfts,
  characterColor,
  characterType,
  onNFTClick,
  onlineUsers = [],
  currentUserId = '',
  myChat = '',
  myChatTimestamp = 0
}: {
  nfts: NFTWithDetails[];
  characterColor: string;
  characterType: string;
  onNFTClick: (nft: NFTWithDetails) => void;
  onlineUsers?: PlayerData[];
  currentUserId?: string;
  myChat?: string;
  myChatTimestamp?: number;
}) {
  return (
    <>
      <Environment preset="sunset" />
      <ambientLight intensity={0.5} />
      <directionalLight
        position={[10, 10, 5]}
        intensity={1}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <pointLight position={[0, 5, 0]} intensity={0.5} color="#fbbf24" />

      <Floor />
      <Walls />

      <Character
        position={[0, 0, 5]}
        color={characterColor}
        isPlayer={true}
        name="나"
        characterType={characterType}
        chatMessage={myChat}
        chatTimestamp={myChatTimestamp}
      />

      {onlineUsers
        .filter(user => user.id !== currentUserId)
        .map((user) => (
          <Character
            key={user.id}
            position={user.position}
            color={user.color}
            name={user.name}
            characterType={user.characterType}
            chatMessage={user.chatMessage}
            chatTimestamp={user.chatTimestamp}
          />
        ))}

      {nfts.map((nft, index) => {
        const angle = (index / nfts.length) * Math.PI * 2;
        const radius = 8;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;

        return (
          <NFTDisplay
            key={nft.id}
            nft={nft}
            position={[x, 1, z]}
            onClick={() => onNFTClick(nft)}
          />
        );
      })}

      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        maxPolarAngle={Math.PI / 2}
        minDistance={3}
        maxDistance={20}
      />
    </>
  );
}

export default function MetaverseScene({
  nfts,
  characterType,
  characterColor,
  onlineUsers,
  currentUserId,
  myChat,
  myChatTimestamp
}: MetaverseSceneProps) {
  const [selectedNFT, setSelectedNFT] = useState<NFTWithDetails | null>(null);

  const handleNFTClick = (nft: NFTWithDetails) => {
    setSelectedNFT(nft);
  };

  return (
    <div className="relative w-full h-screen">
      <Canvas
        shadows
        camera={{ position: [0, 5, 15], fov: 60 }}
        className="bg-gradient-to-b from-orange-900 to-red-950"
      >
        <Scene
          nfts={nfts}
          characterColor={characterColor}
          characterType={characterType}
          onNFTClick={handleNFTClick}
          onlineUsers={onlineUsers}
          currentUserId={currentUserId}
          myChat={myChat}
          myChatTimestamp={myChatTimestamp}
        />
      </Canvas>

      <div className="absolute top-4 left-4 bg-black/70 text-white p-4 rounded-lg backdrop-blur-sm">
        <h3 className="font-bold text-yellow-400 mb-2">조작 방법</h3>
        <ul className="text-sm space-y-1">
          <li>🖱️ 마우스 드래그: 시점 회전</li>
          <li>🔍 마우스 휠: 줌 인/아웃</li>
          <li>👆 NFT 클릭: 상세 정보</li>
        </ul>
      </div>

      <div className="absolute top-4 right-4 bg-black/70 text-white p-4 rounded-lg backdrop-blur-sm">
        <h3 className="font-bold text-yellow-400 mb-2">접속 현황</h3>
        <p className="text-sm">온라인: {onlineUsers?.length || 1}명</p>
        <p className="text-xs text-amber-200 mt-1">보유 NFT: {nfts.length}개</p>
      </div>

      {selectedNFT && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/90 text-white p-6 rounded-lg backdrop-blur-sm max-w-md w-full border-2 border-yellow-500">
          <button
            onClick={() => setSelectedNFT(null)}
            className="absolute top-2 right-2 text-gray-400 hover:text-white"
          >
            ✕
          </button>
          <h3 className="font-bold text-yellow-400 text-xl mb-2">
            {selectedNFT.product?.name}
          </h3>
          <div className="space-y-2 text-sm">
            <p><span className="text-amber-300">브랜드:</span> {selectedNFT.product?.brand}</p>
            <p><span className="text-amber-300">NFT ID:</span> {selectedNFT.nft_id.slice(0, 16)}...</p>
            <p><span className="text-amber-300">발행일:</span> {new Date(selectedNFT.minted_at).toLocaleDateString('ko-KR')}</p>
            <p><span className="text-amber-300">체인:</span> {selectedNFT.chain || 'Base Sepolia'}</p>
          </div>
          <div className="mt-4 flex gap-2">
            <button className="flex-1 bg-yellow-500 text-red-900 py-2 rounded-lg font-bold hover:bg-yellow-400 transition">
              상세보기
            </button>
            <button className="flex-1 bg-green-600 text-white py-2 rounded-lg font-bold hover:bg-green-500 transition">
              거래하기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
