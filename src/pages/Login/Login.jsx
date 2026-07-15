import React, { useState } from 'react'
import './Login.css'
import logo from '../../assets/logo.png'
import './login.css'

const Login = () => {

  const [signinState,setSigninState] = useState("Sign In")
  return (
    <div className='logo'>

      <img src={logo} className="login-logo" alt="" />
      <div className="login-form">
        <h1>{signinState}</h1>
        <form action="">
          {signinState==="Sign Up"? <input type="text" placeholder="Yor Name" />:<></>}
           
            <input type="email" placeholder = "your Email"/>
            <input type="password" placeholder='Your Password'/>
            <button>{signinState}</button>
            <div className="form-help">
              <div className="remember">
                  <input type="checkbox"/>
                  <label>Remember ME</label>
              </div>
              <p>Need Help?</p>
            </div>
        </form>
        <div className="form-switch">
          {signinState ==="Sign In"?<p>New To Netflix? <span onClick={()=>{setSigninState("Sign Up")}} >Sign Up Now</span> </p>:<p>Already have a Account? <span onClick={()=>{setSigninState("Sign In")}}>Sign Up Now</span> </p> }
          
          
          
        </div>
      </div>
    </div>
  )
}

export default Login
