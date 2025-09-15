import {createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode, Dispatch, SetStateAction } from "react";

type Props = {}

const StudentRegisteredCoursesDataContext = createContext<
  | undefined
  | any
>(undefined);

export const StudentRegisteredCoursesDataProvider = ({ children }: { children: ReactNode }) => {
  const [registeredCourses, setRegisteredCourses] = useState<string[]>(() => {
    const storedCourses = localStorage.getItem("registeredCourses");
    return storedCourses ? JSON.parse(storedCourses) : [];
  });
  
  useEffect(()=> {
    
  })
}

const registeredCoursesDataContext = (props: Props) => {
  return (
    <div>registeredCoursesDataContext</div>
  )
}

export default registeredCoursesDataContext