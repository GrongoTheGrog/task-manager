import { use, useState } from 'react';
import { useSiteDefinitions } from '../../context/siteDefinitions';
import './SignIn.css';
import axios from 'axios';

import whiteView from '../../assets/white-view.svg';
import whiteViewOff from '../../assets/white-view-off.svg';
import blackView from '../../assets/black-view.svg';
import blackViewOff from '../../assets/black-view-off.svg';


import { Link, useNavigate } from 'react-router-dom';
import { vi } from 'date-fns/locale';


export function SignIn(){

    const definitions = useSiteDefinitions();

    const api = definitions.api.data;

    const navigator = useNavigate();

        async function submitSignIn(event){
            event.preventDefault();

            
            const setError = definitions.error.change;

            const data = new FormData(event.target);
            const email = data.get('email');
            const username = data.get('username');
            const password = data.get('password');
            const confirmPassword = data.get('confirmPassword');

            if (!password || !confirmPassword || !username || !email) return setError('All fields required.');

            if (password !== confirmPassword) return setError('Passwords have to match.');
        

            try{
                const response = await api.post('http://localhost:9000/signin', {
                    username: username,
                    password: password,
                    email: email
                });


                navigator('/logIn');
            }catch(err) {
                return setError(err.message);
            }

        }

    const [username, setUsername] = useState();
    const [password, setPassword] = useState();
    const [confirmPassword, setconfirmPassword] = useState()


    return (   
        <div className='signin'>
            <span className='title-signin-card'>
                Sign In
            </span>

            <form className='signin-card' onSubmit={submitSignIn}>
                <div className='field-signin-input'>
                    <label 
                        htmlFor='username' 
                        className='label username-label'>
                        Username:
                    </label>

                    <input 
                        name='username' 
                        onChange={(event) => setUsername(event.target.value)} className='input-signin username-input'>
                    </input>

                </div>

                <div className='field-signin-input'>
                    <label 
                        htmlFor='password' 
                        className='label email-password'>
                        Password:
                    </label>

                    <Password change={setPassword} value={password} name='password'/>
                </div>

                <div className='field-signin-input'>
                    <label 
                        htmlFor='confirm-password' 
                        className='label username-label'>
                        Confirm Password:
                    </label>
                    <Password change={setconfirmPassword} value={confirmPassword} name='confirmPassword'/>
                </div>

                <div className='field-signin-input'>
                    <label htmlFor='username' className='label username-label'>
                        Email:
                    </label>
                    <input name='email' onChange={(event) => setUsername(event.target.value)} className='input-signin username-input'>
                    </input>
                </div>

                <button className='submit-signin-form'>
                    Sign In
                </button>

                <Link className='link-signin' to='/logIn'>
                    Alredy have an account? Click here
                </Link>
            </form>
        </div>

    )
}


function Password({change, value, name}){

    const definitions = useSiteDefinitions();

    const [view, setView] = useState(false);

    return(
        <div className='password-container'>
            <input
                type={view ? 'text' : 'password'}
                name={name}
                value={value}
                onChange={(event) => change(event.target.value)}
                className='input-signin password-input'>
            </input>
            <button type='button'  className='view-button-password' onClick={() => setView(prev => !prev)}>
                <i className='material-icons' style={{color: 'var(--primary)'}}>
                    {view ? 'visibility' : 'visibility_off'}
                </i>
            </button>
        </div>
    )
}