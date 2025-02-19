import { useEffect, useState } from 'react';
import './teams.css';
import { useSiteDefinitions } from '../../context/siteDefinitions';
import { Loading } from '../home/home';
import { Link } from 'react-router-dom';
import { sub } from 'date-fns';

export function Teams(){

    const definitions = useSiteDefinitions();

    const [teams, setTeams] = useState();
    const [create, setCreate] = useState(false);
    const [createdTeam, setCreatedTeam] = useState('') 

    useEffect(() => {
        const getData = async () => {
            try{
                const teams = await definitions.api.data.get('http://localhost:9000/getteam');

                setTeams(teams.data);
                console.log(teams.data)
            } catch(err){
                definitions.error.change(err.data.error || err.message);
            }
        }
        getData();
    }, [createdTeam])



    return(
        <section className='teams-container-main'>
            <span className='title-main-teams'>Teams</span>


            {create && <CreateTeam setCreate={setCreate} setCreatedTeam={setCreatedTeam}/>}

            <div className='teams-container-teams'>
                <div to='/' className='create-team-teams' onClick={() => setCreate(() => true)}>
                    <i className={'material-icons loading'}>
                        add
                    </i>
                </div>
                {!teams ? <Loading /> : teams.map(team => <TeamsCard card={team}/>)}
            </div>
        </section>
    )
}

function TeamsCard({card}){
    
    return (
        <Link className='team-card-teams-container' to={`/team/${card._id}`}>
            <span className='title-team-teams'>
                {card.name}
            </span>

            <span className='description-team-teams'>
                {card.description}
            </span>

            <span style={{color: 'var(--secondary)'}}>Members: <strong>{card.members.length}</strong></span>
        </Link>
    )
}

function CreateTeam({setCreate, setCreatedTeam}){

    const [description, setDescription] = useState('');
    const [name, setName] = useState('');

    const definitions = useSiteDefinitions();

    async function submit(event){
        event.preventDefault();
        const data = new FormData(event.target);
        const name = data.get('name');
        const description = data.get('description');
        
        if(!name || !description){
            return definitions.error.change('Both name and description required.');
        }

        try{
            const createdTeam = await definitions.api.data.post('http://localhost:9000/createteam', {
                name,
                description
            });

            setCreatedTeam(() => createdTeam);
            setCreate(() => false)
        }catch(err){
            definitions.error.change(err?.data?.error || err.message);
        }
    }

    return (
        <form className='create-team-container' onSubmit={submit}>
            <span className='title-create-team'>Create your own new team</span>
            <input 
                placeholder='Name' 
                className='input-create-team' 
                name='name'
                value={name}
                onChange={(event) => setName(() => event.target.value)}

                ></input>
            <textarea 
                className='description-create-team' 
                name='description' 
                placeholder='Description'
                value={description}
                onChange={(event) => setDescription(() => event.target.value)}
                ></textarea>

            <div className='buttons'>
                <button type='button' className='delete' onClick={() => {
                    setDescription(() => '');
                    setName(() => '');
                    setCreate(() => null)
                }}>
                    <i className='material-icons'>delete</i>
                </button>

                <button className='send'>
                    <i className='material-icons'>add_circle</i>
                </button>
            </div>
            
        </form>
    )
}