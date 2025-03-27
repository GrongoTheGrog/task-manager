import './App.css';
import { Header } from '../header/header';
import { useNavigate, Routes, Route } from 'react-router-dom';
import { useSiteDefinitions } from '../../context/siteDefinitions';
import {  useEffect } from 'react';
import { SignIn } from '../signIn/SignIn';
import { LogIn } from '../logIn/LogIn';
import { LeftSideBar } from '../leftSideBar/leftSideBar';
import HomeComponent from '../home/homeCompontent';
import { Teams } from '../teams/teams';
import { Tasks } from '../tasks/tasks';
import { Calendar } from '../calendar/calendar';
import { CreateTask } from '../createTask/createTask';
import { OneTeam } from '../teams/teams';
import { ChangePassword } from '../userManagement/changePassword/changePassword';
import UserManagement from '../userManagement/userManagement';
import { useLocation } from 'react-router-dom';

function App() {
  const navigator = useNavigate();
  const location = useLocation();

  const definitions = useSiteDefinitions();
  const {api} = definitions;

  useEffect(() => {
    localStorage.setItem("lastVisitedPage", window.location.pathname);
  }, [location.pathname]);

  

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
          navigator('/');
        }
      };
      getUser();
    }
  }, [api.data, definitions.user])


  const resultLoad = !api.data 

  return (
    <>
      <Header />
      {resultLoad ? 
      <h1>Loading...</h1> :
      <main>
        {definitions.user.data &&
          <LeftSideBar />
        }

        {
          definitions.blanket.data ? 
            <div className='blanket-opacity' onClick={(event) => event.stopPropagation()}>

            </div> : 
            null
        }



        <Routes>
          <Route path='/' element={<HomeComponent />}/>
          <Route path='/signIn' element={<SignIn />}/>
          <Route path='/logIn' element={<LogIn />}/>
          <Route path='/teams' element={<Teams />}>
            <Route path=':team' element={<OneTeam />}/>
          </Route>
          <Route path='/tasks' element={<Tasks />}/>
          <Route path='/calendar' element={<Calendar />}/>
          <Route path='/createTasks/:team' element={<CreateTask update={false}/>}/>
          <Route path='/updateTask/:team/:task' element={<CreateTask update={true}/>}/>
          <Route path='/user' element={<UserManagement />}/>
          <Route path='/changePassword' element={<ChangePassword />}/>
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
