import { createContext, memo, use, useContext, useEffect, useState } from 'react';
import './teams.css';
import { useSiteDefinitions } from '../../context/siteDefinitions';
import { Loading } from '../home/home';
import { Form, Link, Outlet, useNavigate, useParams } from 'react-router-dom';
import { remainingTime } from '../home/home';

//utils
import { transformDay, transformMonth } from '../../utils/time';
import { sub } from 'date-fns';


const Provider = createContext();

function useContextTeam() {
    return useContext(Provider);
}

export function Teams(){

    const definitions = useSiteDefinitions();
    const [tasks, setTasks] = useState();
    const [teamTasks, setTeamTasks] = useState([]);
    const [teams, setTeams] = useState();
    const [createedTeam, setCreatedTeam] = useState();
    const [deletedTeam, setDeletedTeam] = useState();
    const [role, setRole] = useState();
    const navigator = useNavigate();
    const params = useParams()

    const curTeam = teams?.find(team => team._id === params.team) || null; 

    
    /// save highest role 
    useEffect(() => {
        if (curTeam){
            const id = definitions.user.data._id;
            const member = curTeam.members.find(member => member.user._id === id);
            const memberRoles = member.role;
            const possibleRoles = curTeam.possibleRoles;

            const roles = Object.keys(memberRoles)
            .map(key => {
                return {
                    role: key,
                    value: possibleRoles[key]
                }
            })
            .sort((a, b) => {
                return b.value - a.value;
            })
            
            setRole(roles[0]);

        }
    }, [curTeam])


    //check role
    function checkRole(requiredRole){
        if (!curTeam || !role?.value) return false;

        const possibleRoles = curTeam.possibleRoles;
        if (role.value >= possibleRoles[requiredRole]){
            return true;
        }

        return false;
    };






    useEffect(() => {
        const getData = async () => {
                try{
                    const tasks = await definitions.api.data.post('http://localhost:9000/gettasksauthor');
                    const teams = await definitions.api.data.get('http://localhost:9000/getteam');


                    setTasks(() => tasks.data);
                    setTeams(() => teams.data);

                }catch(err){
                    definitions.error.change(err?.data?.error || err.message);
                }
        }   
        getData();
    }, [createedTeam, deletedTeam]);


    //change url to created teams tab
    useEffect(() => {
        createedTeam &&
        navigator('/teams/' + createedTeam?._id);
        setCreatedTeam(() => null);
    }, [createedTeam]);

    //change url to myOwn when deleting team
    useEffect(() => {
        deletedTeam && navigator('/teams/myOwn');
    }, [deletedTeam])



    useEffect(() => {
        if (!tasks) return;

        const array = tasks?.filter(task => {
            if (curTeam) {
                return task?.team?._id === curTeam?._id;
            }else{
                return !task.team;
            }
        });
    

        setTeamTasks(() => array)
    }, [curTeam, tasks])


    const context = {
        role,
        checkRole
    }

    return (
        <Provider.Provider value={context}>
            {tasks && teams ?

                <section className='teams-main-container'>
                    <TeamsNav teams={teams} create={setCreatedTeam} curTeam={curTeam}/>

                    <OneTeam tasks={teamTasks} team={curTeam} role={role} setDeletedTeam={setDeletedTeam}/>

                    {   curTeam ?
                        <Members team={curTeam}/>: 
                        null}

                </section> :

                <Loading/>}
        </Provider.Provider>
    )
}






function TeamsNav({teams, create, curTeam}){

    const navigator = useNavigate();
    const params = useParams();


    const [creating, setCreating] = useState();
    const definitions = useSiteDefinitions();

    function click(value, path){
        return function() {
            navigator(path);
        }
    }

    async function submit(event){
        event.preventDefault();
        const data = new FormData(event.target);
        const name = data.get('name');
        const description = data.get('description');

        if (!name || !description) return definitions.error.change('Both name and description required.');

        try{
            const newTeam = await definitions.api.data.post('http://localhost:9000/createteam', 
                {name, 
                description}
            );


            create(() => newTeam.data);
            setCreating(() => false)
        }catch(err){
            definitions.error.change(err?.data?.error || err.message)
        }
    }



    return(
        <div className='teams-navbar-container'>
            {creating ? (
                <form className='create-task-form' onSubmit={submit}>
                    <labe>
                        Name:
                    </labe>

                    <input name='name' placeholder='e.g: backend team' autoFocus>
                    </input>

                    <labe>
                        Description:
                    </labe>

                    <textarea name='description' placeholder='e.g: backend managment' className='scrollbar'>
                    </textarea>


                    <div className='buttons'>

                        <button className='delete' onClick={() => setCreating(() => false)} type='button'>
                            <i className='material-icons'>
                                delete
                            </i>
                        </button>

                        <button className='create'>
                            <i className='material-icons'>
                                add
                            </i>
                        </button>
                    </div>
                </form>
            ) : (
                <div className='create-team-teams card-teams-nav' onClick={() => setCreating(() => true)}>
                    <i className='material-icons'>
                        add
                    </i>
                </div>

            )}

            <div className={`card-teams-nav ${!curTeam && 'active'}`} onClick={click(null, '/teams/myOwn')}>
                <span>
                    My own tasks
                </span>
            </div>

            {teams.map((team, index) => {

                const cl = team._id === curTeam?._id ? ' active' : ''


                return (
                    <div className={'card-teams-nav' + cl} onClick={click(team, `/teams/${team._id}`)} key={index}>
                        <span>{team.name}</span>
                    </div>
                )
            })}
        </div>
    )
}











export function OneTeam({tasks, team, setDeletedTeam}){




    const todayTasks = [];
    const overdueTasks = [];
    const upcomingTasks = [];
    const today = new Date().getDate();
    const todayWeek = new Date().getDay();
    const month = new Date().getMonth();
    const year = new Date().getFullYear();
    const [deleting, setDeleting] = useState(false);
    const definitions = useSiteDefinitions();
    const {role, checkRole} = useContextTeam();


    function clickDelete(){
        definitions.blanket.change(prev => !prev);
        setDeleting(prev => !prev);
    }


    tasks.forEach(task => {
        const taskDate = new Date(task.deadline);
        if (taskDate.getDate() === today &&
            taskDate.getMonth() === month &&
            taskDate.getFullYear() === year    
        ) {
            todayTasks.push(task);
        };

        if (new Date(task.deadline).getTime() - new Date().getTime() <= 0){
            overdueTasks.push(task);
        }

        const diff = (new Date(task.deadline) - new Date()) / (1000 * 60 * 60 * 24);

        if (diff < 3 && diff > 0){
            upcomingTasks.push(task);
        } 
    });

    function sort(array, greater){
        array.sort((a, b) => {
            const diffa = (new Date(a.deadline) - new Date()) / (1000 * 60 * 60 * 24);
            const diffb = (new Date(b.deadline) - new Date()) / (1000 * 60 * 60 * 24);
            
            let result;
            greater ?
                result = (diffb < diffa ? 1 : diffa === diffb ? 0 : -1) :
                result = (diffb > diffa ? 1 : diffa === diffb ? 0 : -1)

            return result;
        })
    
    }

    sort(overdueTasks, false);
    sort(upcomingTasks, true);
    sort(todayTasks, true);






    return (
        <div className='outer-mid-team-container'>
            <span className='title'>
                

                {deleting ? 
                    <Delete click={clickDelete} team={team} deleting={setDeletedTeam}/> :
                null}

                <div className='info'>
                    {team?.name || 'Your Own Tasks'}
                    <span>
                        {team?.description}
                    </span>
                </div>


                <div className='buttons'>


                    {checkRole('Creator') ? <div className='delete' onClick={clickDelete}>
                        <i className='material-icons'>
                            delete
                        </i>
                        delete team
                    </div> : null}



                    {checkRole('Admin') ? 
                        <Link className='link' to={`/createTasks/${team?._id || undefined}`}>
                            <i className='material-icons'>
                                add
                            </i>
                            create task
                        </Link> : 
                        null}
                </div>
            </span>

            <div className='mid-team-main-information-container'>
                <div className='mid-div-section'>
                    <div className='info-today-display-team'>
                        <div className='today-day'>
                            <span className='today'>{transformDay(todayWeek)}</span>
                        </div>

                        <span>
                            {transformMonth(month)}, {today}
                        </span>

                        <span className='task'>
                            {todayTasks.length ? 
                            `You have ${todayTasks.length} tasks assigned for today.` :
                            "No tasks assigned for today."}
                        </span>

                        {overdueTasks.length ? <span className='task overdue'>
                            You have {overdueTasks.length} overdue tasks.
                        </span> : null}
                    </div>


                    <TaskSection mode='normal' tasks={todayTasks} title='Today'/> 
                


                </div>

                <div className='mid-div-section'>
                    <TaskSection mode='normal' tasks={upcomingTasks} title={'Upcoming tasks (3 days)'}/> 
                </div>

                <div className='mid-div-section'>
                    <TaskSection mode='overdue' tasks={overdueTasks} title={'Overdue tasks'}/> 
                </div>
            </div>
        </div>
    )
}













function TaskSection({mode, tasks, title}){
    //mode => 'overdue' || 'normal' || 'done';


    const color = mode === 'normal' ? 'var(--primary)' : mode === 'done' ? 'var(--secondary)' : 'var(--accent)'

    return(
        <div className='task-section scrollbar'>
            <span style={{color}}>{title}</span>

            {tasks.length ? <div className='tasks-section-inner-flex'>


            {tasks.map((task, index) => {
                const expired = new Date() - new Date(task.deadline) > 0 ? true : false;


                return (
                    <div className='inner-card-task-team' key={task._id}>
                        {expired ? 
                            <div className='expired'>Expired</div> :
                            null}

                        <span style={{fontSize: '20px', fontWeight: 'bold', color}} className='title-inner-card-task-team'>
                            {task.name}
                        </span>
            
                        <span className='tasks-description-card'>
                            {task.description}
                        </span>
            
                        {task.tags.length ? <div className='tags-container-tasks-home'>
                            {task.tags && task.tags.map((tag, index) => {
                                return <span className='tag-card-tasks-home' key={index}>{tag} </span>
                            })}
                        </div> : null}

                        {task.to.length ? 
                            <div className='to-container-teams'>
                                {task.to.map((member, index) => {
                                    return (
                                        <div className='to-card-teams' key={index}>
                                            <i className='material-icons'>
                                                person
                                            </i>

                                            <span>{member.username}</span>
                                        </div>
                                    )
                                })}
                            </div> :
                            null}
            
                        {task.deadline && <div className='dead-line-card-home'>
                            <strong>Deadline:</strong> {remainingTime(new Date(task.deadline).getTime() - new Date().getTime())}
                        </div>}
                    </div>
                )
            })}
            </div> : 
            <div className='no-task-container'>
                <span>No tasks</span>
            </div>
            }
        </div>  )
    
}








function Members({team}){

    const possibleRoles = team.possibleRoles;
    const members = team.members;



    const objectRoles = new Map();

    members.forEach(member => {
        const memberRoles = Object.values(member.role);
        memberRoles.sort((a, b) => {
            return b - a;
        });

        for(let key in possibleRoles){
            if (possibleRoles[key] === memberRoles[0]){
                if(!objectRoles.get(key)){
                    objectRoles.set(key, []);
                }

                const array = objectRoles.get(key);
                   
                objectRoles.set(key, [...array, member]);
                
            }
        }

    })

    const elements = Array.from(objectRoles.entries())
        .sort((a, b) => {
            const aKey = possibleRoles[a[0]];
            const bKey = possibleRoles[b[0]];
            return bKey - aKey;
        })
        .map((role, index) => {
            
            return (
                <div className='role-container-members' key={index}>
                    <span className='role-title-members'>{role[0]}(s)</span>

                    <div className='member-members-flex'>
                        {role[1].map((member, index) => {

                            return (
                                <div className='member-card'>
                                    <span className='name'>{member.user.username}aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa</span>
                                </div>
                            )
                        })}

                    </div>
                </div>
            )
        })

    

    return(
        <div className='members-outer-container'>
            <div className='top-member-container'>
                <i className='material-icons'>
                    groups
                </i>

                <span>Members</span>
            </div>

            <div className='members-container-flex'>
                {elements}
            </div>
        </div>
    )
}







function Delete({click, team, deleting}){

    const definitions = useSiteDefinitions();

    async function submit(event){
        event.preventDefault();
        const data = new FormData(event.target);
        const confirm = data.get('confirm');
        
        if (!confirm) return definitions.error.change('Insert the name.')
        
        if (confirm !== team.name) return definitions.error.change('Name is not macthing.')

        try{
            const response = await definitions.api.data.post('/deleteteam', {
                id: team._id
            });
            

            deleting(() => response.data);
            click();
        }catch(err){
            definitions.error.change(err.message);
        }
    }

    return (
        <form className='deleting-container-team' onSubmit={submit}>
            <label>
                Insert the name of the team to delete:
            </label>

            <input name='confirm'>

            </input>

            <div className='buttons'>
                <button type='button' onClick={click}>
                    Cancel
                </button>

                <button style={{color: 'white', backgroundColor: 'var(--accent)'}}>    
                    Delete
                </button>
            </div>
        </form>
    )
}