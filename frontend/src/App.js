import React, { useState } from "react";
import Axios from "axios";
import './App.css';

function App() {

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [responseData, setResponseData] = useState("")

  const signup = async () => {

    try {
      const response = await Axios.post("http://18.180.45.13:3000/users", {
        name: name,
        email: email,
        password: password
      });
      console.log(response);
      setResponseData(JSON.stringify(response.data.data.user));
    } catch (error) {
      console.log(error);
    }

  };

  return (
    <div className='App'>
      <div className='Signup'>
        <label>name: <input
          type="text"
          onChange={(e) => {
            setName(e.target.value);
          }}
        /></label>
        <label>email: <input
          type="text"
          onChange={(e) => {
            setEmail(e.target.value);
          }}
        /></label>
        <label>password: <input
          type="password"
          onChange={(e) => {
            setPassword(e.target.value);
          }}
        /></label>
        <button onClick={signup}>signup</button>
      </div>
      <div>
        {responseData}
      </div>
    </div>
  );
}

export default App;
