import './App.css';
import ReactDOM from 'react-dom/client';
import { Header } from '../header/header';
import { useNavigate, BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { useSiteDefinitions } from '../../context/siteDefinitions';
import { use, useEffect } from 'react';
import { SignIn } from '../signIn/SignIn';
import { LogIn } from '../logIn/LogIn';
import { LeftSideBar } from '../leftSideBar/leftSideBar';
import { Home } from '../home/home';
import { Teams } from '../teams/teams';
import { Tasks } from '../tasks/tasks';
import { Calendar } from '../calendar/calendar';

function App() {
  const navigator = useNavigate();

  const definitions = useSiteDefinitions();
  const {api, socket, theme} = definitions;
  const user = definitions.user;

  useEffect(() => {
    localStorage.setItem("lastVisitedPage", window.location.pathname);
  }, [window.location.pathname]);


  useEffect(() => {
    if(api.data){
      async function getUser() {
        try{
          const response = await api.data.get('/refresh');

          localStorage.setItem('jwtAccess', response.data.token);
          definitions.user.change(response.data.user);
          navigator(localStorage.getItem('lastVisitedPage') || '/')
        }catch(err){
          definitions.user.change(null);
          definitions.error.change('Session expired.')
          navigator('/logIn');
        }
      };
      getUser();
    }
  }, [api.data])


  const resultLoad = !api.data || !socket.data || !theme.data;

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
          <Route path='/' element={<Home />}/>
          <Route path='/signIn' element={<SignIn />}/>
          <Route path='/logIn' element={<LogIn />}/>
          <Route path='/teams' element={<Teams />}/>
          <Route path='/tasks' element={<Tasks />}/>
          <Route path='/calendar' element={<Calendar />}/>
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
