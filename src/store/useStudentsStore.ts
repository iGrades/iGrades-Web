import { create } from "zustand";
import { supabase } from "@/lib/supabaseClient";

type Student = {
  id: string;
  parent_id: string;
  firstname: string;
  lastname: string;
  email: string;
  school: string;
  class: string;
  date_of_birth: Date;
  gender: string;
  basic_language: string;
  subscription?: string;
  profile_image?: string;
};

type StudentsStore = {
  students: Student[];
  loading: boolean;
  fetchStudents: () => Promise<void>;
  deleteStudent: (id: string) => Promise<void>;
  updateStudent: (updated: Student) => Promise<void>;
  addStudent: (newStudent: Student) => void;
};

export const useStudentsStore = create<StudentsStore>((set, get) => ({
  students: [],
  loading: false,

  fetchStudents: async () => {
    set({ loading: true });
    const { data, error } = await supabase.from("students").select("*");

    if (!error && data) {
      set({ students: data, loading: false });
    } else {
      console.error("Failed to fetch students:", error?.message);
      set({ loading: false });
    }
  },

  deleteStudent: async (id: string) => {
    const { error } = await supabase.from("students").delete().eq("id", id);

    if (!error) {
      set((state) => ({
        students: state.students.filter((student) => student.id !== id),
      }));
    } else {
      console.error("Delete failed:", error.message);
    }
  },

  updateStudent: async (updatedStudent: Student) => {
    const { error } = await supabase
      .from("students")
      .update(updatedStudent)
      .eq("id", updatedStudent.id);

    if (!error) {
      set((state) => ({
        students: state.students.map((student) =>
          student.id === updatedStudent.id ? updatedStudent : student
        ),
      }));
    } else {
      console.error("Update failed:", error.message);
    }
  },

  addStudent: (newStudent: Student) => {
    set((state) => ({
      students: [newStudent, ...state.students],
    }));
  },
}));
