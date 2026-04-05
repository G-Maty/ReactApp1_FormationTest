import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import { PostEditor } from './components/PostEditor';
import { PostList } from './components/PostList';

export default function App() {
  return (
    <Authenticator hideSignUp>
      {({ signOut, user }) => (
        <div style={{ maxWidth: 800, margin: '0 auto', padding: '24px' }}>
          <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <h1>投稿管理</h1>
            <div>
              <span style={{ marginRight: 16 }}>{user?.signInDetails?.loginId}</span>
              <button onClick={signOut}>ログアウト</button>
            </div>
          </header>
          <PostEditor />
          <PostList />
        </div>
      )}
    </Authenticator>
  );
}
