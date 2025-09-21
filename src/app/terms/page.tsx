const TermsPage = () => {
  return (
    <div className="bg-gray-900 text-gray-300 min-h-screen">
      <div className="container mx-auto px-4 py-12 md:py-20">
        <div className="max-w-3xl mx-auto bg-gray-800 p-8 rounded-lg shadow-lg">
          <h1 className="text-3xl font-bold mb-6 text-white border-b border-gray-700 pb-4">利用規約</h1>
          
          <p className="mb-6">当サイトをご利用いただく前に、以下の利用規約（以下、「本規約」といいます。）をよくお読みください。</p>

          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mt-6 mb-3 text-amber-400">第1条（適用）</h2>
              <p>本規約は、ユーザーと当サイト運営者との間のすべての関係に適用されます。当サイトを利用することで、ユーザーは本規約に同意したものとみなされます。</p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mt-6 mb-3 text-amber-400">第2条（知的財産権）</h2>
              <p>当サイトに掲載されている文章、画像、動画、ロゴ、その他すべてのコンテンツの著作権、商標権、その他の知的財産権は、当サイト運営者または正当な権利を有する第三者に帰属します。法律で認められる私的利用の範囲を超えて、無断で複製、転用、販売などの二次利用を行うことを禁じます。</p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mt-6 mb-3 text-amber-400">第3条（禁止事項）</h2>
              <p>ユーザーは、当サイトの利用にあたり、以下の行為をしてはなりません。</p>
              <ul className="list-disc list-inside pl-4 mt-2 space-y-1">
                <li>法令または公序良俗に違反する行為</li>
                <li>当サイトの運営を妨げるおそれのある行為</li>
                <li>他のユーザー、第三者、または当サイト運営者の権利（著作権、プライバシー権等）を侵害する行為</li>
                <li>他のユーザー、第三者、または当サイト運営者を誹謗中傷する行為</li>
                <li>不正アクセス、またはこれを試みる行為</li>
                <li>その他、当サイト運営者が不適切と判断する行為</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-semibold mt-6 mb-3 text-amber-400">第4条（サービスの停止・変更）</h2>
              <p>当サイト運営者は、以下のいずれかの事由があると判断した場合、ユーザーに事前に通知することなく当サイトの全部または一部の提供を停止または中断することができるものとします。</p>
              <ul className="list-disc list-inside pl-4 mt-2 space-y-1">
                <li>システムのメンテナンスまたは更新を行う場合</li>
                <li>火災、停電、天災などの不可抗力により、サービスの提供が困難となった場合</li>
                <li>その他、運営上の都合でサービスの提供が困難と判断した場合</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-semibold mt-6 mb-3 text-amber-400">第5条（免責事項）</h2>
              <p>当サイト運営者は、当サイトに掲載されている情報の正確性について万全を期しておりますが、その内容の完全性、正確性、有用性、安全性を保証するものではありません。当サイトの利用によりユーザーに生じたいかなる損害についても、当サイト運営者は一切の責任を負いません。</p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mt-6 mb-3 text-amber-400">第6条（規約の変更）</h2>
              <p>当サイト運営者は、必要と判断した場合には、ユーザーに通知することなくいつでも本規約を変更することができるものとします。変更後の規約は、当サイト上に掲載された時点から効力を生じるものとします。</p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mt-6 mb-3 text-amber-400">第7条（準拠法・裁判管轄）</h2>
              <p>本規約の解釈にあたっては、日本法を準拠法とします。当サイトに関して紛争が生じた場合には、東京地方裁判所を第一審の専属的合意管轄裁判所とします。</p>
            </div>
          </div>

          <div className="mt-10 pt-6 border-t border-gray-700 text-sm text-gray-400">
            <p>制定日：2025年9月21日</p>
            <p>運営：株式会社Loco（FOOTBALLTOP運営チーム）</p>
            <p>お問い合わせ：footballtop.info@gmail.com</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsPage;
