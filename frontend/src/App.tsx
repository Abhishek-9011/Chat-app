import { useState } from "react";

function App() {
  let [message, setMessage] = useState([]);
  let handleSubmit = ()=>{
    
  }
  return (
    <>
      <div>
        <h3>Messages</h3>

      </div>
      <input type="text" placeholder="Your message" />
      <button onClick={handleSubmit}>Submit</button>
    </>
  );
}

export default App;
