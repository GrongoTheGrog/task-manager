import { useEffect, useRef, useState } from 'react';
import './userManagement.css';
import { useSiteDefinitions } from '../../context/siteDefinitions';
import { Link, useNavigate } from 'react-router-dom';

export default function UserManagement(){
    
    const {user, api, error} = useSiteDefinitions();
    const navigator = useNavigate();

    async function logout(){
        try{
            await api.data.post('/logout');
            user.change(null);
            navigator('/');
        }catch(err){
            error.change(err?.response?.data.error || err.message);  
        }
    }

    return (
        <div className='user-outer-container'>
            <h2 className='user-title'>
                <i className='material-icons'>
                    person
                </i>

                Profile
            </h2>

            <div className='user-inner-container'>
                <span>
                    <i className='material-icons'>
                        person
                    </i>
                    Username
                </span>

                <Input value={user?.data?.username} label={'username'}/>

                <span>
                    <i className='material-icons'>
                        mail
                    </i>
                    Email
                </span>
                <Input value={user?.data?.email} label={'email'}/>

                <Link className='link-change-password-user' to='/changePassword'>
                    <i className='material-icons'>
                        key
                    </i>

                    change password
                </Link>

                <button className='logout-button' onClick={logout}>
                    <i className='material-icons'>
                        logout
                    </i>
                    Log Out
                </button>
            </div>
        </div>
    )
}


function Input({className, value, label}){

    const {user, error, api} = useSiteDefinitions();
    const [changing, setChanging] = useState(false);
    const [input, setInput] = useState(value);
    const container = useRef();

    

    useEffect(() => {
        function click(e) {
            if (container.current.contains(e.target)) {
                return;
            }else{
                setChanging(false);
            }

        }

        document.addEventListener('click', click);

        return () => document.removeEventListener('click', click);

    }, [container]);

    async function send(e){
        if ((e?.key === 'Enter' || !e?.key) && changing){
            const id = user.data._id;
            if (!input) return error.change("Input can't be empty.")
            try{
                await api.data.post('/updateUser', {
                    id,
                    [label]: input
                }) 
                user.change({
                    ...user.data,
                    [label]: input
                });
                setChanging(prev => !prev);
            }catch(err){
                error.change(err?.response?.data.error || err.message);
            }
        }
    };


    return (
    <div className='input-container-user' ref={container}>
        {!changing ? 
            (
                <div className='div-user'>
                    {value}
                </div>
            ) :
            (
                <input 
                    className={'input-user ' + className}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={send}
                >

                </input>
            )
        }

        <div className='buttons'>
            <div className={!changing ? 'edit-hover-user' : 'send-hover-user'} style={{backgroundColor: (!changing ? 'var(--primary)' : 'var(--secondary')}} onClick={changing ? send : () => {
                setChanging(true);
                setInput('')
            }}>
                <i className='material-icons edit-icons'>
                    {changing ? 'check' : 'edit'}
                </i>
            </div>

            {changing ? <div className='send-hover-user' style={{backgroundColor: 'var(--accent)'}} onClick={() => setChanging(false)}>
                <i className='material-icons edit-icons'>
                    close
                </i>
            </div> : null}
        </div>
    </div>)
}