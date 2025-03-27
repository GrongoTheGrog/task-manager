import { act, useReducer } from 'react';
import './changePassword.css';
import { useSiteDefinitions } from '../../../context/siteDefinitions';
import { useNavigate } from 'react-router-dom';

function reducer(state, action){
    switch(action.type){
        case 'email-sent':
            return {
                ...state,
                pageStage: 1
            }
        
        case 'code-approved':
            return {
                ...state,
                pageStage: 2
            }
        
        case 'update-email':
            return {
                ...state,
                email: action.value
            }
        
        case 'update-code':
            return {
                ...state,
                code: action.value
            }
        
        case 'change-current-email':
            return {
                ...state,
                currentEmail: action.email
            }

        case 'update-new-password':
            return {
                ...state,
                newPassword: action.value
            }

        case 'update-confirm-password':
            return {
                ...state,
                confirmPassword: action.value
            }

        default:
            throw Error('Unknown action.');
    }
}


export function ChangePassword(){

    const navigator = useNavigate();

    const [state, dispatch] = useReducer(reducer, { 
        pageStage: 0, 
        email: '',
        code: '',
        currentEmail: '0',
        newPassword: '',
        confirmPassword: ''
    });
    const {error, api} = useSiteDefinitions();

    function dealEmailChange(e){
        dispatch({
            type: 'update-email',
            value: e.target.value
        })
    }

    function dealCodeChange(e){
        dispatch({
            type: 'update-code',
            value: e.target.value
        })
    }

    async function createPassWord() {
        const {newPassword, confirmPassword} = state;
        if (newPassword.length < 5) return error.change('Password must contain 6 letters or more');
        if (newPassword !== confirmPassword) return error.change('Passwords have to match.');

        try{
            await api.data.post('/changePassword', {
                email: state.currentEmail,
                newPassword: state.newPassword
            });
        }catch(err){
            error.change(err?.response?.data.error || err.message);  
        }
    }

    async function sendCode(){
        try{
            await api.data.post('/sendEmail', {
                email: state.email
            })

            dispatch({type: 'email-sent'});
            dispatch({type: 'change-current-email', email: state.email});
        }catch(err){
            error.change(err?.response?.data.error || err.message);
        }
    }

    async function submitCode() {
        try{
            await api.data.post('/approveCode', {
                code: state.code,
                email: state.currentEmail
            });

            dispatch({type: 'code-approved'});
            navigator('/user');
        }catch(err){
            error.change(err?.response?.data.error || err.message)
        }
    }

    return(
        <div className='change-password-outer-container'>
            <h2 className='user-title'>
                <i className='material-icons'>
                    key
                </i>

                Change Password
            </h2>

            <div className='change-password-inner-container'>
                {state.pageStage !== 2 ?
                    <span>
                        <i className='material-icons'>
                            mail
                        </i>
                        Email
                    </span> : null}

                {state.pageStage !== 2 ? <div>
                    <input className='input-email-change' value={state.email} onChange={dealEmailChange} placeholder='taskifymessager@gmail.com'>
                    </input>

                    <button className='send-code-button' onClick={sendCode}>
                        {state.pageStage === 0 ? 'Send Code' : 'Resend Code'}
                    </button>
                </div> : null}

                {state.pageStage === 1 ? (
                    <div className='insert-code-outer-container'>
                        <span>
                            <i className='material-icons'>
                                key
                            </i>
                            Enter the code:
                        </span>

                        <input className='input-email-change' value={state.code} onChange={dealCodeChange} placeholder='XXXXXX'>
                        </input>

                        <button className='approve-code-button' onClick={submitCode}>
                            Submit
                        </button>
                    </div>
            ) : null}


            {state.pageStage === 2 ? (
                <div className='new-passwords-outer-container'>
                    <span>
                        Enter the new password:
                    </span>

                    <input className='input-email-change' value={state.newPassword} onChange={(e) => {
                        dispatch({type: 'update-new-password', value: e.target.value})
                    }}>
                    </input>


                    <span style={{marginTop: '20px'}}>
                        Confirm the new password:
                    </span>

                    <input className='input-email-change' value={state.confirmPassword} onChange={(e) => {
                        dispatch({type: 'update-confirm-password', value: e.target.value})
                    }}>
                    </input>


                    <button className='set-new-password-button' onClick={createPassWord}>
                        Change Password
                    </button>
                </div>
            ) : null}
            </div>
        </div>
    )
}