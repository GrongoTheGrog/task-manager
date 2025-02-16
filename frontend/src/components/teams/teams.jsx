import { useEffect, useState } from 'react';
import './teams.css';
import { useSiteDefinitions } from '../../context/siteDefinitions';
import { Loading } from '../home/home';
import { Link } from 'react-router-dom';

export function Teams(){

    const definitions = useSiteDefinitions();

    const [teams, setTeams] = useState();

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
    }, [])



    return(
        <section className='teams-container-main'>
            <span className='title-main-teams'>Teams</span>

            <div className='teams-container-teams'>
                <Link to='/' className='create-team-teams'>
                    <i className={'material-icons loading'}>
                        add
                    </i>
                </Link>
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

            <span>Members: {card.members.length}</span>
        </Link>
    )
}