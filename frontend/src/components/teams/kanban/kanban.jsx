import { useEffect, useState } from 'react';
import './kanban.css';
import { Dropdown } from './dropdown/dropdown';
import { isToday, setDate } from 'date-fns';
import { DndContext } from '@dnd-kit/core';
import { useDroppable } from '@dnd-kit/core';
import { useDraggable } from '@dnd-kit/core';
import { useNavigate } from 'react-router-dom';
import { useSiteDefinitions } from '../../../context/siteDefinitions';
import { useContextTeam } from '../teams';
import { remainingTime } from '../../home/home';

const dateFilters = [
    {label: 'All', value: null},
    {label: 'This month', value: 'month'},
    {label: 'This week', value: 'week'},
    {label: 'Today', value: 'today'},
    {label: 'Last Week', value: 'lastweek'},
    {label: 'Last Month', value: 'lastmonth'}
]

const priorityFilters = [
    {label: 'All', value: 'All'},
    {label: 'Urgent', value: 'Urgent'},
    {label: 'Very high', value: 'Very high'},
    {label: 'High', value: 'High'},
    {label: 'Medium', value: 'Medium'},
    {label: 'Low', value: 'Low'},
    {label: 'Very low', value: 'Very low'},

]

const timeFilters = [
    {label: 'Newest', value: 'Newest'},
    {label: 'Oldest', value: 'Oldest'}
]

const columns = [
    {title: 'Todo', id: 'Todo', color: 'var(--purple)'},
    {title: 'In Progress', id: 'In Progress', color: 'var(--primary)'},
    {title: 'Done', id: 'Done', color: 'var(--primary)'},
    {title: 'Approved', id: 'Approved', color: 'var(--secondary)'}
]


export function Kanban({tasks}){

    const [searchInput, setSearchInput] = useState('');

    const [fisrtList, setFirstList] = useState(tasks);
    const [tasksList, setTasksList] = useState([]);
    const [finalList, setFinalList] = useState([]);
    const {checkRole, setTasks} = useContextTeam();

    const {error, api} = useSiteDefinitions();

    useEffect(() => {
        setFirstList(tasks)
    }, [tasks]);

    //set change the state every time tasks change

    //set the date filter
    const [dateFilter, setDateFilter] = useState(null);

    //set the priority filter
    const [priorityFilter, SetPriorityFilter] = useState(null);

    //set the time filter
    const [timeFilter, setTimeFilter] = useState(null);

    //current drag
    const [currentDrag, setCurrentDrag] = useState(null);



    useEffect(() => {
        if (searchInput.length){
            setFinalList(prev => tasksList.filter(task => {
                return task.name.slice(0, searchInput.length) === searchInput;
            }))
        }else{
            setFinalList(tasksList);
        }
    }, [searchInput, tasksList]);

    useEffect(() => {
        let list = fisrtList;

        //handle priority
        if (priorityFilter){
            if (priorityFilter !== 'All'){
                list = list.filter(task => {
                    return Object.keys(task.priority)[0] === priorityFilter;
                });
            }
            
        }


        //sort by date
        const today = new Date();
        
        switch (dateFilter) {
            //filter by the same month as today
            case 'month':
                list = list.filter(task => {
                    const date = new Date(task.deadline);

                    const isYear = today.getFullYear() === date.getFullYear();
                    const isMonth = today.getMonth() === date.getMonth();

                    return isYear && isMonth;
                });
                break;
            
            //filter by the same week as today
            case 'week':
                list = list.filter(task => {
                    const date = new Date(task.deadline);
                    const weekDay = today.getDay();

                    const firstDayWeek = new Date(today);
                    firstDayWeek.setDate(today.getDate() - weekDay);
                    firstDayWeek.setHours(0, 0, 0);

                    const lastDayWeek = new Date(firstDayWeek);
                    lastDayWeek.setDate(firstDayWeek.getDate() + 6);
                    lastDayWeek.setHours(23, 59, 59);

                    const time = date.getTime();
                    return lastDayWeek.getTime() > time && firstDayWeek.getTime() < time;
                });
                break;
            
                //get today tasks
            case 'today':
                list = list.filter(task => {
                    const date = new Date(task.deadline);

                    const isYear = today.getFullYear() === date.getFullYear();
                    const isMonth = today.getMonth() === date.getMonth();
                    const isDay = today.getDate() === date.getDate();

                    return isYear && isMonth && isDay
                });
                break;
            

            //get tasks from the last week
            case 'lastweek':
                list = list.filter(task => {
                    const date = new Date(task.deadline);
                    const weekDay = today.getDay();

                    const firstDayWeek = new Date(today);
                    firstDayWeek.setDate(today.getDate() - weekDay - 7); //less seven because its last week
                    firstDayWeek.setHours(0, 0, 0);

                    const lastDayWeek = new Date(firstDayWeek);
                    lastDayWeek.setDate(firstDayWeek.getDate() + 6);
                    lastDayWeek.setHours(23, 59, 59);

                    const time = date.getTime();
                    return lastDayWeek.getTime() > time && firstDayWeek.getTime() < time;
                })
                break;
            

            //last month
            case 'lastmonth':
                list = list.filter(task => {
                    const date = new Date(task.deadline);
                    const todayMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
                    
                    const isYear = todayMonth.getFullYear() === date.getFullYear();
                    const isMonth = todayMonth.getMonth() === date.getMonth();


                    return isYear && isMonth;
                });
                break;

            default:
                break;
        }


        //sort by deadline date
        list.sort((a, b) => {
            const aTime = new Date(a.deadline).getTime();
            const bTime = new Date(b.deadline).getTime();
    
            switch (timeFilter) {
                case 'Newest':
                    return aTime - bTime;
                case 'Oldest':
                    return bTime - aTime;
            }
        })


        setTasksList(list);
    }, [priorityFilter, dateFilter, timeFilter, fisrtList])


    return (
        <DndContext onDragEnd={dragEnd} onDragStart={dragStart}>
            <div className='kanban-outer-div'>
                <div className='search-kanban'>
                    <div className='input'>
                        <input
                            placeholder='Search the tasks'
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                        >
                        </input>
                        <button onClick={() => setSearchInput('')}>
                            <i className='material-icons'>
                                {searchInput.trim().length ?
                                'close' :
                                'search'}
                            </i>
                        </button>
                    </div>
                    <div className='right-search-kanban'>
                        <span>
                            <i className='material-icons'>
                                filter_alt
                            </i>
                            Filters:
                        </span>
                        <Dropdown 
                            list={dateFilters} 
                            change={setDateFilter} 
                            label={'Date: '} 
                            />
                        <Dropdown 
                            list={priorityFilters} 
                            change={SetPriorityFilter} 
                            label={'Priorities: '}
                            />
                        <Dropdown 
                            list={timeFilters} 
                            change={setTimeFilter} 
                            label={'Time: '}
                            />
                    </div>
                </div>
                <div className='main-kanban'>
                    {
                        columns.map((column, index) => (
                            <ColumnDropable 
                                id={column.id} 
                                color={column.color} 
                                title={column.title}       
                                tasks={finalList}
                                currentDrag={currentDrag}
                                key={index}
                                />
                        ))
                    }
                </div>
            </div>
        </DndContext>
    )

    function dragStart(event){
        setCurrentDrag(tasks.find(task => {
            return task._id === event.active.id;
        }));
    }

    function dragEnd(event){
        //check if dragging isnt over
        if (!event.over || !currentDrag) return;

        //check if user can change status from approved to other
        if (currentDrag.status === 'Approved' && !checkRole('task:accept', true)){
            return error.change("You don't have the permission to change the status of that task.");
        }

        //check if user can change status from any to approved
        if (event.over.id === 'Approved' && !checkRole('task:accept', true)){
            return error.change("You don't have the permission aprove tasks.");
        }



        setTasks(prev => prev.map(task => {
            if (task._id !== event.active.id) return task;

            return {
                ...task,
                status: event.over.id
            }
        }))

        api.data.post('/edittask', {
            id: event.active.id,
            status: event.over.id
        })
    }
}



function ColumnDropable({tasks = [], id, color, title, currentDrag}){
    const {isOver, setNodeRef} = useDroppable({id});
    
    const style = isOver ? 'hover' : '';
    const tasksStatus = tasks.filter(task => task.status === title);


    return(
        <div className={'column-kanban-outer ' + style} ref={setNodeRef}>

            <div className='decoration' style={{backgroundColor: color}}></div>

            <span className='column-kanban-title' style={{color}}> 
                {title}
            </span>

            {tasksStatus.length ? 
            <div className='column-kanban-flex'>
                {tasksStatus.map(task => (
                    <CardDraggable task={task} color={color} currentDrag={currentDrag}/>
                ))}
            </div> : 
            <div className='column-no-tasks-kanban'>
                <span>
                    No tasks found
                </span>
            </div>
            }
        </div>
    )
}

function CardDraggable({task, color, currentDrag}){

    const navigator = useNavigate();
    const {checkRole} = useContextTeam();
    const {attributes, listeners, setNodeRef, transform} = useDraggable({
        id: task._id,
    });  

    const {setDeletedTask} = useContextTeam();
    const {api, error} = useSiteDefinitions();

    const style = transform && currentDrag
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    }
    : undefined;

    const expired = new Date().getTime() - new Date(task.deadline).getTime() > 0; 

        
    function clickUpdate(event){
        event.stopPropagation();
        navigator('/updateTask/' + (task?.team?._id || undefined) + '/' + task._id);
    }


    async function clickDelete(event){
        event.stopPropagation();
        try{
            await api.data.post('/deletetask', {
                id: task._id
            });
        }catch(err){
            error.change(err?.response?.data.error || err.message);
        }
        setDeletedTask(task._id);
        
    }

    return(
        <div 
            {...listeners} 
            {...attributes} 
            style={style} 
            ref={setNodeRef} 
            key={task._id}
            className={'task-card-kanban ' + (transform ? 'drag' : '') + (currentDrag === task._id ? 'current' : '')}
        >


            {expired && task.status !== 'Approved' ?
            <span className='expired'>
                Expired
            </span> :
            null
            }

            <span className='expired' style={{backgroundColor: 'var(--primary)'}}>
                {Object.keys(task.priority)[0]}
            </span>

            <span className='title-kanban-task' style={{color}}>
                {task.name}
            </span>

            <span className='description-kanban-task'>
                {task.description}
            </span>

            <div className='tag-container-kanban'>
                {task.tags.map(tag => (
                    <span className='tag-card-kanban'>{tag}</span>
                ))}
            </div>


            <div className='to-container-kanban'>   
                {task.to.map(member => {
                    return (
                        <span className='to-card-kanban'>
                            <i className='material-icons' style={{fontSize: '18px'}}>
                                person
                            </i>
                            {member.username}
                        </span>
                    )
                })}
            </div>

            <span className='remaining-time-kanban'>
                {remainingTime(new Date(task.deadline).getTime() - new Date().getTime())}
            </span>

            {checkRole('task:create', true) ? <span className='update-icon-button' onMouseDown={clickUpdate}>
                <i className='material-icons'>
                    edit
                </i>
            </span> : null}


            {checkRole('task:delete', true) ? <span className='update-icon-button delete' onMouseDown={clickDelete}>
                <i className='material-icons'>
                    delete
                </i>
            </span> : null}
        </div>
    )
}