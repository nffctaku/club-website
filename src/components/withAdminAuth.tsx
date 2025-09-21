'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, ComponentType } from 'react';

const withAdminAuth = <P extends object>(WrappedComponent: ComponentType<P>) => {
  const Wrapper = (props: P) => {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!loading) {
        // 認証状態のチェックが完了したら
        if (!user) {
          // 未ログインの場合はトップページへ
          console.log('Admin Guard: Not logged in. Redirecting to /');
          router.push('/');
        } else if (user.uid !== process.env.NEXT_PUBLIC_ADMIN_UID) {
          // 管理者でない場合はトップページへ
          console.log('Admin Guard: Not an admin. Redirecting to /');
          router.push('/');
        }
      }
    }, [user, loading, router]);

    // ローディング中または管理者である場合は、何も表示しない（ラップされたコンポーネントが表示される）
    if (loading || !user || user.uid !== process.env.NEXT_PUBLIC_ADMIN_UID) {
      return <div className="flex justify-center items-center min-h-screen">Loading...</div>; // or a loading spinner
    }

    return <WrappedComponent {...props} />;
  };

  return Wrapper;
};

export default withAdminAuth;
