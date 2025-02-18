import World from "@react-map/world";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const MyMap = () => {
  // Convert to a functional component and export it
  // Define the onselect function that takes in a name
  const mapToast = (sc) => {
    // Rename 'toast' to 'mapToast' to avoid confusion with react-toastify's toast
    toast(sc); // Use react-toastify's toast function here
  };

  return (
    <div>
      {" "}
      {/* Wrap the components in a div or React.Fragment */}
      <World
        onSelect={mapToast} // Use the renamed function
        size={[2000, 2000]} // Example size, adjust as needed
        hoverColor="orange"
        type="select-single"
        
      />
      <ToastContainer />{" "}
      {/*  ToastContainer needs to be rendered to show toasts */}
    </div>
  );
};

export default MyMap;
