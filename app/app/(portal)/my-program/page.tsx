import { redirect } from "next/navigation";

// "My Program" was never backed by real data; enrolled programmes live under
// Courses > Enrollments. Keep the old URL working.
export default function MyProgramPage() {
  redirect("/courses/enrollments");
}
