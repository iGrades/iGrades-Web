import { useState } from "react"
import { Flex } from "@chakra-ui/react"
import LearnNav from "../components/learn/learnNav"
import Subjects from "../components/learn/subject/subjects"
import PQs from "../components/learn/pqs/PQs"
import Pdfs from "../components/learn/pdf/pdfs"

const LearnPage = () => {
  const [learnState, setLearnState] = useState<string | null>("subjects")
  return (
    <Flex w={{ base: "full", md: "95%" }} m="auto" mb={10} direction="column">
      <LearnNav
        learnState={learnState}
        setLearnState={setLearnState}
      />
      {learnState === "pdfs" ? (
        <Pdfs />
      ) : learnState === "pqs" ? (
        <PQs />
      ) : learnState === "subjects" ? (
        <Subjects />
      ) : (
        <Subjects />
      )}
    </Flex>
  );
}

export default LearnPage