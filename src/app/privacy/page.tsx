const PrivacyPolicyPage = () => {
  return (
    <div className="bg-gray-900 text-gray-300 min-h-screen">
      <div className="container mx-auto px-4 py-12 md:py-20">
        <div className="max-w-3xl mx-auto bg-gray-800 p-8 rounded-lg shadow-lg">
          <h1 className="text-3xl font-bold mb-6 text-white border-b border-gray-700 pb-4">プライバシーポリシー</h1>
          
          <p className="mb-6">FOOTBALL TOP（以下、「当サイト」といいます。）は、ユーザーの個人情報保護の重要性について認識し、個人情報の保護に関する法律（以下、「個人情報保護法」といいます。）を遵守すると共に、以下のプライバシーポリシー（以下、「本ポリシー」といいます。）に従い、適切な取扱い及び保護に努めます。</p>

          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mt-6 mb-3 text-amber-400">第1条（個人情報の定義）</h2>
              <p>本ポリシーにおいて、個人情報とは、個人情報保護法第2条第1項により定義された個人情報、すなわち、生存する個人に関する情報であって、当該情報に含まれる氏名、生年月日その他の記述等により特定の個人を識別することができるもの（他の情報と容易に照合することができ、それにより特定の個人を識別することができることとなるものを含みます。）を意味します。</p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mt-6 mb-3 text-amber-400">第2条（個人情報の収集）</h2>
              <p>当サイトは、お問い合わせフォームなどを通じて、氏名、メールアドレス、その他ユーザーが任意に提供する情報を収集することがあります。また、当サイトの利用状況を把握するため、Cookieやアクセスログを収集することがあります。</p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mt-6 mb-3 text-amber-400">第3条（個人情報の利用目的）</h2>
              <p>当サイトは、収集した個人情報を以下の目的で利用します。</p>
              <ul className="list-disc list-inside pl-4 mt-2 space-y-1">
                <li>お問い合わせへの対応のため</li>
                <li>当サイトのサービス向上・改善のため</li>
                <li>当サイトの運営上必要な事項の通知のため</li>
                <li>法令、利用規約等に基づく権利の行使や義務の履行のため</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-semibold mt-6 mb-3 text-amber-400">第4条（第三者提供）</h2>
              <p>当サイトは、法令で認められる場合を除き、あらかじめユーザーの同意を得ることなく、個人情報を第三者に提供することはありません。</p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mt-6 mb-3 text-amber-400">第5条（Cookieの使用）</h2>
              <p>当サイトでは、サービスの品質向上のためにGoogle Analyticsなどのアクセス解析ツールを利用しており、Cookieを使用しています。これにより、当サイトはお客様のトラフィックデータを収集しますが、これは匿名で収集されており、個人を特定するものではありません。ユーザーはブラウザの設定でCookieを無効にすることができます。</p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mt-6 mb-3 text-amber-400">第6条（プライバシーポリシーの変更）</h2>
              <p>当サイトは、必要に応じて本ポリシーを変更することがあります。変更後のポリシーは、当サイト上に掲載された時点から効力を生じるものとします。</p>
            </div>

             <div>
              <h2 className="text-xl font-semibold mt-6 mb-3 text-amber-400">第7条（お問い合わせ）</h2>
              <p>本ポリシーに関するお問い合わせは、以下の連絡先までお願いいたします。</p>
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

export default PrivacyPolicyPage;
