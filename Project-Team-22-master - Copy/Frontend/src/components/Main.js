import React, {Component} from 'react';
import {Route, Switch} from 'react-router-dom';
import Login from './Login/Login';
import Signup from './Signup/Signup';
import Home from './Home/Home';
import Delete from './Delete/Delete';
import Create from './Create/Create';
import Navbar from './LandingPage/Navbar';
import Matches from './Matches/Matches';
import Upload from './Upload/Upload';
//Create a Main Component
class Main extends Component {
    render(){
        return(
            <div>
                {/*Render Different Component based on Route*/}
                <Switch>
               <Route exact path="/login"/>
               <Route exact path="/signup"/>
               <Route path="/" component={Navbar}/>
               </Switch>
                <Route path="/login" component={Login}/>
                <Route path="/signup" component={Signup}/>
                <Route path="/home" component={Home}/>
                <Route path="/delete" component={Delete}/>
                <Route path="/create" component={Create}/>
                <Route path="/matches" component={Matches}/>
                <Route path="/upload" component={Upload}/>
            </div>
        )
    }
}
//Export The Main Component
export default Main;
