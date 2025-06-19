import { useState } from "react";
import {getParentId} from "../utils/getParentId";
import { supabase } from "../../lib/supabaseClient";
import { Input } from "@chakra-ui/react";

function AddGrader() {
  const [formData, setFormData] = useState({
    email: "",
    firstname: "",
    lastname: "",
    date_of_birth: "",
    gender: "",
    class: "",
    basic_language: "",
    school:"",
    profile_image: "",
  });



  const [status, setStatus] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("Adding student...");

    const parentId = await getParentId();

    console.log("Parent ID:", parentId); // Debugging line
    

    if (!parentId) {
      setStatus("Parent not found or not authenticated.");
      return;
    }

    const { error } = await supabase.from("students").insert({
      ...formData,
      parent_id: parentId,
    });

    if (error) {
      setStatus("Error: " + error.message);
    } else {
      setStatus("Student added successfully!");
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ padding: "1rem" }}>
        {["firstname", "lastname", "email", "date_of_birth", "class", "basic_language", "school", "profile_image"].map((index, field) => (
            <Input
              key={field}
              name={index}
              placeholder={index.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())}
              onChange={handleChange}
              required
              type={index === "email" ? "email" : index === "date_of_birth" ? "date" : "text"}
              />
        ))}
      <select name="gender" onChange={handleChange} required>
        <option value="">Select Gender</option>
        <option value="male">Male</option>
        <option value="female">Female</option>
      </select>
      <button type="submit">Add Student</button>
      <p>{status}</p>
    </form>
  );
}
export default AddGrader;