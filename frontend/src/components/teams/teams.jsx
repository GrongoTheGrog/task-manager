import { createContext, forwardRef, memo, use, useContext, useEffect, useRef, useState } from 'react';
import './teams.css';
import { useSiteDefinitions } from '../../context/siteDefinitions';
import { Loading } from '../home/home';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { remainingTime } from '../home/home';

//utils
import { transformDay, transformMonth } from '../../utils/time';
import { set } from 'date-fns';


const Provider = createContext();

function useContextTeam() {
    return useContext(Provider);
}

export function Teams(){

    const definitions = useSiteDefinitions();

    //tasks states
    const [tasks, setTasks] = useState();             //all tasks
    const [teamTasks, setTeamTasks] = useState([]);     //just the current teamTasks

    //team states
    const [teams, setTeams] = useState();               //all the user teams
    const [curTeam, setCurTeam] = useState();           //current team
    const [members, setMembers] = useState([])          //sorted members list
    const [createedTeam, setCreatedTeam] = useState();  //to make it fetch again
    const [deletedTeam, setDeletedTeam] = useState();   //to make it fetch again
    const [addMember, setAddMember] = useState();       //to make it fetch again

    //authorization
    const [roles, setRoles] = useState([]);             //roles array ['Creator', 'Member']
    const [permissions, setPermissions] = useState();   //permissions 

    //navigation
    const navigator = useNavigate();
    const params = useParams()                          // {team: ...}


    
    //save permissions and roles
    useEffect(() => {
        if (curTeam){
            //create id to look for which member is loged user
            const id = definitions.user.data._id;
            //search for user
            const member = curTeam.members.find(member => member.user._id === id);
            
            

            //create a variable for member roles and possible roles
            const memberRoles = member.role;
            const possibleRoles = curTeam.possibleRoles;

            //create a new set to store all permissions 
            const permissions = new Set();
            
            //sets, with no duplicates, all the permissions user currently has 
            memberRoles.forEach(role => {
                const rolePermitions = possibleRoles[role].permissions;
                rolePermitions.forEach(permission => {
                    permissions.add(permission);
                })
            })
            
            //assign to states
            setRoles(memberRoles);
            setPermissions(permissions);
        }
    }, [curTeam])


    
    //check if user has required permission (allow if !curTeam and allowedOwnTasks)
    function checkRole(permission, allowedOwnTasks){
        
        if(permissions){//allow when in ownTasks page
            if (allowedOwnTasks && !curTeam) return true;
            if (!allowedOwnTasks && !curTeam) return false;


            //check if set() permissions has permission
            if (permissions.has(permission)) return true;
            return false;
        }
    };


    //changes the team and tasks when currentTeam changes
    useEffect(() => {
        setMembers();
        if (curTeam){

            //set members
            async function getMembers() {
                const members = await definitions.api.data.post('/getsortedmembers', {
                    teamId: curTeam._id
                });

                setMembers(members.data);
            }

            getMembers();

            //get the socket from definitions
            const socket = definitions.socket.data;

            //emits the event for joining the socket room
            socket.emit('join-team', curTeam._id);


            //listen to new tasks

            const handleNewTask = (task) => {
                console.log('create task event');
                setAddMember(task);
            }

            socket.on('create-task', handleNewTask);
            console.log('create task listener')

            return () => socket.off('create-task', handleNewTask);
        }
    }, [curTeam]);
    
    console.log(teamTasks)
    //listen to added member
    useEffect(() => {
        function handleAddedMember(member){
            setAddMember(member);
            console.log('new member accepted')
        }


        definitions.socket.data.on('add-member', handleAddedMember);
        definitions.socket.data.on('leave-team', handleAddedMember);
        console.log('user events')

        return () => {
            definitions.socket.data.off('add-member', handleAddedMember);
            definitions.socket.data.off('leave-team', handleAddedMember);
        }
    }, [definitions.socket.data])


    //chage tasks and teams when delete and create teams
    useEffect(() => {
        const getData = async () => {
                try{
                    const teamId = params.team || null; 
                    const tasks = await definitions.api.data.post('/gettasksauthor');
                    const teams = await definitions.api.data.get('/getteam');

                    setTasks(tasks.data);
                    setTeams(teams.data);

                }catch(err){
                    definitions.error.change(err?.data?.error || err.message);
                }
        }   
        getData();
    }, [createedTeam, deletedTeam, addMember, definitions.enteringTeam.data]);


    //set current team 
    useEffect(() => {
        if(teams){
            const team = teams.find(team => team._id === params.team);
            setCurTeam(team);
        }
    }, [window.location.pathname, teams])


    //set the team quests
    useEffect(() => {
        if (tasks){
            if (curTeam){
                const teamTasks = tasks.filter(task => task.team._id === curTeam._id);
                setTeamTasks(teamTasks);
                return;
            }
    
            const teamTasks = tasks.filter(task => !task.team);
            setTeamTasks(teamTasks);
        }
        if (curTeam){
            const teamTasks = tasks.filter(task => task.team._id === curTeam._id);
            setTeamTasks(teamTasks);
            return;
        }
    }, [tasks, curTeam])

    console.log(tasks)

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


    //create with crucial information for all nested components of teams page
    const context = {
        members,                    //sorted members list
        roles,                      //roles is an array ['Admin', 'Member'];
        checkRole,                  //function that checks if current user has permission
        setCreatedTeam,             //updates the state when creates team
        setDeletedTeam              //updates the state when deletes team
    }



    return (
        <Provider.Provider value={context}>
            {tasks && teams && (members || !curTeam) ?

                <section className='teams-main-container'>
                    <TeamsNav teams={teams} create={setCreatedTeam} curTeam={curTeam}/>

                    <OneTeam tasks={teamTasks} team={curTeam} setDeletedTeam={setDeletedTeam}/>

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

    //for clicking each team card and navigate
    function click(value, path){
        return function() {
            //leave room in the websocket, so it doesnt trigger when in other room
            if (curTeam){
                definitions.socket.data.emit('leave-room', curTeam._id);
            }

            //take user to selected team
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
    const {checkRole} = useContextTeam();


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


                    {checkRole('team:delete', false) ? <div className='delete' onClick={clickDelete}>
                        <i className='material-icons'>
                            delete
                        </i>
                        delete team
                    </div> : null}



                    {checkRole('task:create', true) ? 
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

    const {members} = useContextTeam();

    const possibleRoles = team.possibleRoles;
    const definitions = useSiteDefinitions();
    const [leaving, setLeaving] = useState();
    const {checkRole, setDeletedTeam} = useContextTeam();
    const [addingMember, setAddingMember] = useState(false);

    //toggles the blanket and the adding member element
    function clickAddMember(){
        definitions.blanket.change(prev => !prev);
        setAddingMember(prev => !prev)
    }


    //creates a map for storing the sorted order of each
    //role due to possible roles level. Also store in it each 
    //user that has the role as its highest.
    const objectRoles = {};

    function getHighestRole(member){
        let currentRole;

        member.role.forEach(role => {
            const level = possibleRoles[role].level;
            if (level > currentRole?.level || !currentRole){
                currentRole = {
                    role,
                    ...possibleRoles[role]
                }
            }
        })
        return currentRole;
    }


    //sets to objects role
    members.forEach(member => {
        const role = getHighestRole(member);
        if (!objectRoles[role.role]){
            objectRoles[role.role] = [];
        }

        objectRoles[role.role].push(member);;
    });

    const elements = []

    for (let key in objectRoles){


        elements.push(

            <div className='role-container-members'>
                {addingMember ? 
                <AddMember toggle={clickAddMember} team={team}/> :
                null}

                <div className='members-header'>
                    <span className='role-title-members'>{key}(s)</span>
                </div>

                <div className='member-members-flex'>
                    {objectRoles[key].map((member, index) => {


                        const me = member.user.username === definitions.user.data.username ? 'me' : '';

                        return (
                            <CardMember 
                                member={member} 
                                me={me} 
                                key={index} 
                                setLeaving={setLeaving}/>
                        )
                    })}

                </div>


                {leaving ? 
                    <div className='leaving-container' onClick={(event) => event.stopPropagation()}>
                        Are you sure you want to leave?
                        <div className='buttons'>
                            <button onClick={() => {
                                setLeaving(() => false);
                                definitions.blanket.change(() => false);
                            }}>
                                Cancel
                            </button>

                            <button style={{backgroundColor: 'var(--accent)', color: 'white'}} onClick={leaveTeam}>
                                Leave
                            </button>
                        </div>
                    </div> :
                    null
                }

                    </div>
        )
    }

    async function leaveTeam(){
        try{
            const leftTeam = await definitions.api.data.post('/leaveteam', {
                id: team._id
            })

            setDeletedTeam(() => leftTeam.data);
            setLeaving(() => false);
            definitions.blanket.change(() => false);
        }catch(err){
            definitions.error.change(err?.response?.data?.error || err.message);
        }
    }


    

    return(
        <div className='members-outer-container'>
            <div className='members-header'>
                {checkRole('members:invite') ? 
                <div className='button-add-member' onClick={clickAddMember}>
                    <i className='material-icons'>
                        person_add
                    </i>
                </div> : null}

                <div className='top-member-container'>
                    <span>Members</span>
                </div>
            </div>

            <div className='members-container-flex'>
                {elements}
            </div>
        </div>
    )
}


function CardMember({member, me, setLeaving}){

    const [display, setDisplay] = useState(false);
    const [above, setAbove] = useState(false);
    const container = useRef();
    const toolbox = useRef();


    useEffect(() => {
        function handleClick(event){

            if (
            container.current &&
            toolbox.current &&
            !container.current?.contains(event.target) && 
            !toolbox.current?.contains(event.target)){
                setDisplay(() => false);
            }
        }

        document.addEventListener('click', handleClick);

        return () => document.removeEventListener('click', handleClick);

    }, [toolbox.current])

    function click(event){
        setDisplay(prev => !prev);
        const windowHeight = window.innerHeight;
        const isAbove = event.clientY > windowHeight / 2;

        setAbove(() => isAbove);
    }

    const cl = above ?
    ' above' : 
    ''

    return (
        <div 
        className={'member-card ' + me + (display ? ' active' : '')} 
        onClick={click}
        ref={container}

        >
            <span className={'name '}>{member.user.username}</span>

            {display ?
                <UserToolBox 
                    member={member} 
                    setLeaving={setLeaving}
                    cl={cl} 
                    ref={toolbox}/> :
                null}
        </div>
    )
}



//user management
const UserToolBox = forwardRef(({member, cl, setLeaving}, ref) => {

    const {roles, checkRole} = useContextTeam();
    const {user, error, blanket} = useSiteDefinitions();
    const me = member.user.username === user.data.username;


    let memberRole;


    member.role.forEach((value, key) => {
        if(!memberRole || value.level > memberRole[1]) memberRole = [key, value.level]
    })


    //prevent from taking click to document
    function clickToolbox(event){
        event.stopPropagation();
    }

    return (
        <div className={'member-toolbox-container-outer ' + cl} ref={ref} onClick={clickToolbox}>
            <span className='name'>
                {member.user.username}
            </span>
            <span className='role'>
                {Object.keys(memberRole)[0]}
            </span>

            {me ?
            <button className='leave-team' onClick={() => {
                setLeaving(() => true);
                blanket.change(() => true);
            }}>
                leave team
            </button> :
            null
            }
        </div>
    )
})




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




function AddMember({toggle, team}){

    const [userInput, setUserInput] = useState();
    const {error, api, user} = useSiteDefinitions();
    const [users, setUsers] = useState([]);


    async function submit(event) {
        event.preventDefault();

        const data = new FormData(event.target);
        const userMeta = data.get('user');

        if (user.data.username === userMeta || user.data.username === userMeta) return error.change('Select an user that is not yourself.');

        for (let c = 0; c < team.members.length; c++){
            const {user} = team.members[c];

            if(user.username === userMeta || user.email === userMeta) return error.change('Select an user that is not on your team.')
        }

        if (users.find(user => user.username === userMeta || user.username === userMeta)) {
            return error.change('User alredy picked.')
        }


        if (!user) return error.change('Enter email or username.');

        try{    
            const data = await api.data.post('/getUser', {
                user: userMeta
            });

            setUsers(prev => [...prev, data.data]);
            setUserInput(() => '');

        }catch(err){
            error.change(err?.response.data.error || err.message);
        }
    }


    async function createReq(){
        try{   
            if (users.length < 1) return error.change('Choose an user so you can invite.')

            const requests = await api.data.post('/createreq', {
                to: users,
                team: team._id
            });

            toggle();
        }catch(err){
            error.change(err?.response.data.error || err.message);
        }

    }


    return (
        <div className='adding-member-container'>
            <span>
                Enter the email or username:
            </span> 

            <form className='form-add-member' onSubmit={submit}>
                <input 
                placeholder='taskify@gmail.com' 
                name='user' 
                value={userInput}
                onChange={event => setUserInput(() => event.target.value)}
                >

                </input>

                <button>
                    <i className='material-icons'>
                        add
                    </i>
                </button>
            </form>

            <div className='users-adding-member-flex'>
                {users ? users.map(user => {
                    return (
                    <div className='added-user'>
                        {user.email}

                        <i className='material-icons' onClick={() => setUsers(prev => {
                            return prev.filter(userState => userState.email !== user.email);
                        })}>  
                            close
                        </i>
                    </div>
                    )
                }) : null}
            </div>


            <div className='buttons'>
                <button className='cancel-adding-members' onClick={toggle}>
                    Cancel
                </button>
                
                <button className='invite-members-buttom' style={{backgroundColor: 'var(--secondary)', color: 'white'}} onClick={createReq}>
                    Invite
                </button>
            </div>
        </div>
    )
}


