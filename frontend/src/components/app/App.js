import './App.css';
import ReactDOM from 'react-dom/client';
import { Header } from '../header/header';
import { useNavigate, BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { useSiteDefinitions } from '../../context/siteDefinitions';
import { use, useEffect } from 'react';
import { SignIn } from '../signIn/SignIn';
import { LogIn } from '../logIn/LogIn';
import { LeftSideBar } from '../leftSideBar/leftSideBar';

function App() {
  const navigator = useNavigate();

  const definitions = useSiteDefinitions();
  const {api, socket, theme} = definitions;
  console.log(definitions)
  const user = definitions.user;

  useEffect(() => {
    if (!user.data) return navigator('/signIn');
    console.log(user.data)
  }, [user.data])


  useEffect(() => {
    if(api.data){
      async function getUser() {
        try{
          const response = await api.data.get('/refresh');
        }catch(err){
          definitions.user.change(null);
          navigator('/logIn');
        }
      };
      getUser();
    }
  }, [api.data])

  const resultLoad = !api || !socket || !theme;

  return (
    <>
      <Header />
      {resultLoad ? 
      <h1>Loading...</h1> :
      <main>
        {definitions.user.data &&
          <LeftSideBar />
        }



        <Routes>
          <Route path='/' element={<h1>home page</h1>}/>
          <Route path='/signIn' element={<SignIn />}/>
          <Route path='/logIn' element={<LogIn />}/>
        </Routes>
      </main>
      }

      <div className='error-container'>
        <span className='span'>{definitions.error.data}</span>
      </div>
    </>
  );
}

export default App;
