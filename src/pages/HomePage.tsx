import { Link } from 'react-router-dom';
import { Award, Shield, Zap, CheckCircle } from 'lucide-react';

export function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-slate-900 mb-6">
            블록체인 기반 명품 정품 인증
          </h1>
          <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
            K-AUS는 명품 구매 시 자동으로 블록체인 NFT 정품 인증서를 발급하여
            위조를 방지하고 소유권을 투명하게 증명합니다.
          </p>
          <div className="flex justify-center space-x-4">
            <Link
              to="/products"
              className="bg-slate-900 text-white px-8 py-3 rounded-lg font-medium hover:bg-slate-800 transition-colors"
            >
              상품 둘러보기
            </Link>
            <Link
              to="/signup"
              className="bg-white text-slate-900 px-8 py-3 rounded-lg font-medium border-2 border-slate-900 hover:bg-slate-50 transition-colors"
            >
              지금 시작하기
            </Link>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-20">
          <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
            <div className="bg-slate-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <Shield className="h-6 w-6 text-slate-900" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">위조 방지</h3>
            <p className="text-slate-600">
              블록체인의 불변성을 활용하여 위조가 불가능한 정품 인증서를 제공합니다.
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
            <div className="bg-slate-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <Zap className="h-6 w-6 text-slate-900" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">자동 발급</h3>
            <p className="text-slate-600">
              구매와 동시에 자동으로 NFT 정품 인증서가 발급되어 번거로움이 없습니다.
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
            <div className="bg-slate-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <Award className="h-6 w-6 text-slate-900" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">영구 보관</h3>
            <p className="text-slate-600">
              블록체인에 영구적으로 기록되어 언제 어디서나 소유권을 증명할 수 있습니다.
            </p>
          </div>
        </div>

        <div className="bg-slate-900 text-white rounded-2xl p-12">
          <h2 className="text-3xl font-bold mb-6 text-center">작동 방식</h2>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="bg-white text-slate-900 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-xl">
                1
              </div>
              <h4 className="font-bold mb-2">회원가입</h4>
              <p className="text-slate-300 text-sm">
                계정 생성 시 블록체인 지갑 자동 생성
              </p>
            </div>

            <div className="text-center">
              <div className="bg-white text-slate-900 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-xl">
                2
              </div>
              <h4 className="font-bold mb-2">명품 구매</h4>
              <p className="text-slate-300 text-sm">
                원하는 명품을 선택하고 구매
              </p>
            </div>

            <div className="text-center">
              <div className="bg-white text-slate-900 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-xl">
                3
              </div>
              <h4 className="font-bold mb-2">NFT 발급</h4>
              <p className="text-slate-300 text-sm">
                자동으로 정품 인증 NFT 발급
              </p>
            </div>

            <div className="text-center">
              <div className="bg-white text-slate-900 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-xl">
                4
              </div>
              <h4 className="font-bold mb-2">인증서 확인</h4>
              <p className="text-slate-300 text-sm">
                마이페이지에서 인증서 조회 및 관리
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
