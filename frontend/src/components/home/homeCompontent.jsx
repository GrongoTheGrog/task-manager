import { useSiteDefinitions } from "../../context/siteDefinitions"
import { Home } from "./unloggedHome/home"
import { LoggedHome } from "./loggedHome/loggedHome";

export default function HomeComponent(){

    const {user} = useSiteDefinitions();

    return user.data ? 
    (
        <LoggedHome />
    ) : 
    
    (
        <Home />
    )
}