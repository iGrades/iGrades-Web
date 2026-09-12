import { useEffect } from "react";
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Badge,
  Link,
  Separator,
} from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import { FiShield, FiArrowLeft, FiClock } from "react-icons/fi";
import NavBar from "./LandingPage/navBar";
import Footer from "./LandingPage/footer";

export default function PrivacyPolicy() {
  useEffect(() => {
    document.title = "iGrades Privacy Policy";
    window.scrollTo(0, 0);

    // Update meta description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement("meta");
      metaDesc.setAttribute("name", "description");
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute(
      "content",
      "Read the iGrades Privacy Policy to understand how we collect, use, store, protect, and process student and user information across our digital learning platform."
    );
  }, []);

  return (
    <Box bg="#F8FAFC" minH="100vh" color="#0F172A">
      <NavBar />

      {/* Header Banner */}
      <Box
        bg="linear-gradient(180deg, #EBF3FF 0%, #F8FAFC 100%)"
        borderBottom="1px solid"
        borderColor="gray.200"
        pt={{ base: 10, md: 14 }}
        pb={{ base: 8, md: 12 }}
      >
        <Container maxW="4xl" px={{ base: 4, sm: 6 }}>
          <HStack mb={4} gap={2} fontSize="sm">
            <Link
              asChild
              color="#206CE1"
              fontWeight="600"
              display="inline-flex"
              alignItems="center"
              gap={1.5}
              _hover={{ textDecoration: "underline" }}
            >
              <RouterLink to="/">
                <FiArrowLeft size={16} /> Back to Home
              </RouterLink>
            </Link>
          </HStack>

          <HStack gap={3} mb={3} flexWrap="wrap">
            <Badge
              bg="#206CE1"
              color="white"
              px={3}
              py={1}
              borderRadius="full"
              fontSize="xs"
              fontWeight="700"
              textTransform="uppercase"
              letterSpacing="0.05em"
              display="inline-flex"
              alignItems="center"
              gap={1.5}
            >
              <FiShield size={13} /> Official Legal Document
            </Badge>
            <HStack color="#64748B" fontSize="xs" fontWeight="500" gap={1}>
              <FiClock size={13} />
              <Text>Effective Date: September 12, 2026</Text>
            </HStack>
          </HStack>

          <Heading
            as="h1"
            fontSize={{ base: "28px", sm: "36px", md: "42px" }}
            fontWeight="800"
            letterSpacing="-0.02em"
            color="#07052A"
            lineHeight="1.2"
            mb={3}
          >
            iGrades Privacy Policy
          </Heading>

          <Text fontSize={{ base: "sm", md: "md" }} color="#475569" maxW="2xl" lineHeight="1.6">
            This Privacy Policy explains how iGrades collects, uses, stores, protects, and otherwise
            processes information when you use the iGrades website, applications, learning services,
            and related features.
          </Text>

          <HStack mt={5} gap={4} fontSize="xs" color="#64748B" flexWrap="wrap">
            <Link
              asChild
              color="#206CE1"
              fontWeight="600"
              _hover={{ textDecoration: "underline" }}
            >
              <RouterLink to="/terms-of-service">
                View Terms of Service &rarr;
              </RouterLink>
            </Link>
            <Text>•</Text>
            <Text>Last Updated: September 12, 2026</Text>
          </HStack>
        </Container>
      </Box>

      {/* Main Document Content */}
      <Container maxW="4xl" px={{ base: 4, sm: 6 }} py={{ base: 8, md: 12 }}>
        <Box
          bg="white"
          borderRadius={{ base: "xl", md: "2xl" }}
          border="1px solid"
          borderColor="gray.200"
          boxShadow="sm"
          p={{ base: 5, sm: 8, md: 12 }}
        >
          <VStack align="stretch" gap={8} fontSize={{ base: "sm", sm: "15px", md: "16px" }} lineHeight="1.75" color="#334155">
            {/* Preamble */}
            <Box>
              <Text fontWeight="600" color="#0F172A" mb={2}>
                Effective Date: September 12, 2026
              </Text>
              <Text mb={3}>
                iGrades ("iGrades", "we", "us", or "our") is a digital learning platform designed to
                help students learn, practice, understand concepts, track their academic progress, and
                build effective study habits.
              </Text>
              <Text mb={3}>
                This Privacy Policy explains how we collect, use, store, protect, and otherwise process
                information when you use the iGrades website, applications, learning services, and
                related features (collectively, the "Service").
              </Text>
              <Text fontWeight="500" color="#0F172A">
                By using iGrades, you acknowledge that you have read and understood this Privacy Policy.
              </Text>
            </Box>

            <Separator borderColor="gray.200" />

            {/* Section 1 */}
            <Box>
              <Heading as="h2" fontSize={{ base: "xl", md: "22px" }} fontWeight="700" color="#07052A" mb={3}>
                1. Information We Collect
              </Heading>
              <Text mb={4}>
                Depending on how you use iGrades, we may collect the following categories of information.
              </Text>

              {/* 1.1 */}
              <Box mb={4} pl={{ base: 2, md: 4 }} borderLeft="3px solid #206CE1">
                <Heading as="h3" fontSize={{ base: "md", md: "17px" }} fontWeight="700" color="#1E293B" mb={2}>
                  1.1 Account and Profile Information
                </Heading>
                <Text mb={2}>
                  When you create an iGrades account, we may collect information such as:
                </Text>
                <Box as="ul" pl={6} style={{ listStyleType: "disc" }}>
                  <li>Name</li>
                  <li>Email address</li>
                  <li>Password or authentication credentials where applicable</li>
                  <li>Student or parent account type</li>
                  <li>Class or educational level</li>
                  <li>School-related information where provided</li>
                  <li>Subjects or learning interests</li>
                  <li>Profile information you choose to provide</li>
                </Box>
              </Box>

              {/* 1.2 */}
              <Box mb={4} pl={{ base: 2, md: 4 }} borderLeft="3px solid #206CE1">
                <Heading as="h3" fontSize={{ base: "md", md: "17px" }} fontWeight="700" color="#1E293B" mb={2}>
                  1.2 Google Sign-In Information
                </Heading>
                <Text mb={2}>
                  If you choose to sign in or create an account using Google Sign-In, Google may
                  provide us with information associated with your Google account that is made
                  available through the authentication process.
                </Text>
                <Text mb={2}>This may include information such as:</Text>
                <Box as="ul" pl={6} mb={3} style={{ listStyleType: "disc" }}>
                  <li>Name</li>
                  <li>Email address</li>
                  <li>Profile information</li>
                  <li>Google account identifier</li>
                </Box>
                <Text mb={2}>
                  We use this information to authenticate your account, create or maintain your
                  iGrades account, and provide the Service to you.
                </Text>
                <Text>
                  We do not request access to your Google account beyond the permissions necessary for
                  authentication and the information made available through the sign-in process.
                </Text>
              </Box>

              {/* 1.3 */}
              <Box mb={4} pl={{ base: 2, md: 4 }} borderLeft="3px solid #206CE1">
                <Heading as="h3" fontSize={{ base: "md", md: "17px" }} fontWeight="700" color="#1E293B" mb={2}>
                  1.3 Learning and Academic Activity
                </Heading>
                <Text mb={2}>
                  When you use iGrades, we may collect information about your activity on the platform, including:
                </Text>
                <Box as="ul" pl={6} mb={3} style={{ listStyleType: "disc" }}>
                  <li>Quizzes attempted</li>
                  <li>Quiz scores</li>
                  <li>Quiz completion history</li>
                  <li>Subjects and topics studied</li>
                  <li>Learning progress</li>
                  <li>Study activity</li>
                  <li>Learning streaks</li>
                  <li>Goals and preferences</li>
                  <li>iGG Points earned or redeemed</li>
                  <li>Rewards and store-credit activity</li>
                  <li>Other information generated through your use of learning features</li>
                </Box>
                <Text>
                  This information helps iGrades provide progress tracking, personalized learning experiences,
                  recommendations, rewards, and other educational features.
                </Text>
              </Box>

              {/* 1.4 */}
              <Box mb={4} pl={{ base: 2, md: 4 }} borderLeft="3px solid #206CE1">
                <Heading as="h3" fontSize={{ base: "md", md: "17px" }} fontWeight="700" color="#1E293B" mb={2}>
                  1.4 Parent and Student Information
                </Heading>
                <Text mb={2}>
                  Where iGrades provides parent/student connected-account functionality, we may
                  process information necessary to establish and maintain the relationship between the
                  relevant accounts.
                </Text>
                <Text mb={2}>
                  This may allow authorized parents to view appropriate information about a connected
                  student's learning progress.
                </Text>
                <Text>
                  We aim to provide access to student information only to users who are authorized to
                  access it through the applicable iGrades account and permissions.
                </Text>
              </Box>

              {/* 1.5 */}
              <Box mb={4} pl={{ base: 2, md: 4 }} borderLeft="3px solid #206CE1">
                <Heading as="h3" fontSize={{ base: "md", md: "17px" }} fontWeight="700" color="#1E293B" mb={2}>
                  1.5 Subscription and Transaction Information
                </Heading>
                <Text mb={2}>
                  If you purchase an iGrades subscription or use features involving payments, we may process information necessary to manage:
                </Text>
                <Box as="ul" pl={6} mb={3} style={{ listStyleType: "disc" }}>
                  <li>Subscription status</li>
                  <li>Subscription plan</li>
                  <li>Invoice information</li>
                  <li>Store-credit balances</li>
                  <li>iGG Points conversion and redemption</li>
                  <li>Transaction records</li>
                </Box>
                <Text>
                  Payment-card information may be processed by third-party payment providers rather than
                  being stored directly by iGrades, depending on the payment method used.
                </Text>
              </Box>

              {/* 1.6 */}
              <Box mb={4} pl={{ base: 2, md: 4 }} borderLeft="3px solid #206CE1">
                <Heading as="h3" fontSize={{ base: "md", md: "17px" }} fontWeight="700" color="#1E293B" mb={2}>
                  1.6 Device and Technical Information
                </Heading>
                <Text mb={2}>
                  When you use iGrades, certain technical information may be collected automatically, including:
                </Text>
                <Box as="ul" pl={6} mb={3} style={{ listStyleType: "disc" }}>
                  <li>IP address</li>
                  <li>Browser type</li>
                  <li>Device type</li>
                  <li>Operating system</li>
                  <li>Application information</li>
                  <li>Approximate usage information</li>
                  <li>Error and diagnostic information</li>
                  <li>Authentication and security information</li>
                </Box>
                <Text>
                  We use technical information primarily to operate, secure, maintain, troubleshoot, and improve the Service.
                </Text>
              </Box>

              {/* 1.7 */}
              <Box pl={{ base: 2, md: 4 }} borderLeft="3px solid #206CE1">
                <Heading as="h3" fontSize={{ base: "md", md: "17px" }} fontWeight="700" color="#1E293B" mb={2}>
                  1.7 Communications
                </Heading>
                <Text mb={2}>
                  If you contact us or communicate with iGrades, we may retain information necessary to
                  respond to your request and maintain records of the communication.
                </Text>
                <Text mb={2}>We may also send service-related communications such as:</Text>
                <Box as="ul" pl={6} mb={3} style={{ listStyleType: "disc" }}>
                  <li>Account verification emails</li>
                  <li>Password or authentication messages</li>
                  <li>Subscription notifications</li>
                  <li>Important service announcements</li>
                  <li>Security notifications</li>
                </Box>
                <Text>
                  Where required, we will obtain appropriate consent before sending marketing communications.
                </Text>
              </Box>
            </Box>

            <Separator borderColor="gray.200" />

            {/* Section 2 */}
            <Box>
              <Heading as="h2" fontSize={{ base: "xl", md: "22px" }} fontWeight="700" color="#07052A" mb={3}>
                2. How We Use Information
              </Heading>
              <Text mb={2}>We may use information collected through iGrades to:</Text>
              <Box as="ul" pl={6} mb={3} style={{ listStyleType: "disc" }}>
                <li>Create and manage user accounts</li>
                <li>Authenticate users</li>
                <li>Provide access to the Service</li>
                <li>Provide learning content and educational features</li>
                <li>Track academic progress</li>
                <li>Record quiz activity and results</li>
                <li>Provide personalized learning experiences</li>
                <li>Support the Spark AI learning companion</li>
                <li>Provide recommendations and learning assistance</li>
                <li>Operate iGG Points and rewards</li>
                <li>Manage subscriptions and store credit</li>
                <li>Communicate with users about their accounts</li>
                <li>Detect and prevent fraud, abuse, and unauthorized activity</li>
                <li>Maintain platform security</li>
                <li>Diagnose technical problems</li>
                <li>Improve the Service</li>
                <li>Develop and evaluate platform features</li>
                <li>Comply with applicable legal obligations</li>
                <li>Protect the rights, safety, and security of iGrades and its users</li>
              </Box>
              <Text>
                We will not use personal information for purposes materially different from those
                described in this Privacy Policy without appropriate notice or other lawful basis where required.
              </Text>
            </Box>

            <Separator borderColor="gray.200" />

            {/* Section 3 */}
            <Box>
              <Heading as="h2" fontSize={{ base: "xl", md: "22px" }} fontWeight="700" color="#07052A" mb={3}>
                3. Spark and AI Features
              </Heading>
              <Text mb={3}>
                iGrades may provide AI-powered educational functionality through its Spark learning companion.
              </Text>
              <Text mb={3}>
                Spark may use information available within the iGrades learning environment, such as
                relevant learning context, questions, topics, progress, and interactions, to provide
                educational assistance and personalized learning support.
              </Text>
              <Text mb={3}>
                The purpose of Spark is to support learning and understanding. AI-generated responses
                may occasionally contain errors, and students should not treat Spark as an infallible
                source of academic or professional advice.
              </Text>
              <Text>
                We seek to limit the information provided to AI systems to what is reasonably necessary
                for the relevant educational functionality.
              </Text>
            </Box>

            <Separator borderColor="gray.200" />

            {/* Section 4 */}
            <Box>
              <Heading as="h2" fontSize={{ base: "xl", md: "22px" }} fontWeight="700" color="#07052A" mb={3}>
                4. How We Share Information
              </Heading>
              <Text mb={3}>We do not sell users' personal information.</Text>
              <Text mb={3}>
                We may share or provide access to information when reasonably necessary to operate the Service, including with:
              </Text>

              <Box mb={3} pl={{ base: 2, md: 4 }}>
                <Heading as="h3" fontSize={{ base: "md", md: "17px" }} fontWeight="700" color="#1E293B" mb={2}>
                  Service Providers
                </Heading>
                <Text mb={2}>We may use trusted third-party service providers for functions such as:</Text>
                <Box as="ul" pl={6} mb={2} style={{ listStyleType: "disc" }}>
                  <li>Authentication</li>
                  <li>Database and data storage</li>
                  <li>Email delivery</li>
                  <li>Hosting and infrastructure</li>
                  <li>AI services</li>
                  <li>Payment processing</li>
                  <li>Analytics or diagnostics</li>
                  <li>Security and fraud prevention</li>
                </Box>
                <Text>
                  These providers may process information on our behalf and are expected to handle
                  information according to applicable contractual and legal requirements.
                </Text>
              </Box>

              <Box mb={3} pl={{ base: 2, md: 4 }}>
                <Heading as="h3" fontSize={{ base: "md", md: "17px" }} fontWeight="700" color="#1E293B" mb={2}>
                  Legal and Safety Requirements
                </Heading>
                <Text mb={2}>
                  We may disclose information when we reasonably believe disclosure is necessary to:
                </Text>
                <Box as="ul" pl={6} mb={2} style={{ listStyleType: "disc" }}>
                  <li>Comply with applicable law or legal process</li>
                  <li>Respond to lawful requests from authorities</li>
                  <li>Protect the rights, property, or safety of iGrades, our users, or others</li>
                  <li>Detect, investigate, or prevent fraud, abuse, security incidents, or other unlawful activity</li>
                </Box>
              </Box>

              <Box pl={{ base: 2, md: 4 }}>
                <Heading as="h3" fontSize={{ base: "md", md: "17px" }} fontWeight="700" color="#1E293B" mb={2}>
                  Business Transfers
                </Heading>
                <Text>
                  If iGrades is involved in a merger, acquisition, restructuring, financing, sale of assets,
                  or similar business transaction, information may be transferred as part of that
                  transaction, subject to applicable law.
                </Text>
              </Box>
            </Box>

            <Separator borderColor="gray.200" />

            {/* Section 5 */}
            <Box>
              <Heading as="h2" fontSize={{ base: "xl", md: "22px" }} fontWeight="700" color="#07052A" mb={3}>
                5. Supabase and Other Infrastructure
              </Heading>
              <Text mb={3}>
                iGrades uses third-party infrastructure and technology providers to operate portions of
                the Service, including services for authentication, databases, storage, and application functionality.
              </Text>
              <Text mb={3}>
                These providers may process information according to their own privacy policies and contractual obligations.
              </Text>
              <Text>
                We seek to configure these services with appropriate access controls and security measures.
              </Text>
            </Box>

            <Separator borderColor="gray.200" />

            {/* Section 6 */}
            <Box>
              <Heading as="h2" fontSize={{ base: "xl", md: "22px" }} fontWeight="700" color="#07052A" mb={3}>
                6. Data Security
              </Heading>
              <Text mb={3}>
                We take reasonable technical and organizational measures to protect information against
                unauthorized access, alteration, disclosure, loss, or destruction.
              </Text>
              <Text mb={2}>These measures may include:</Text>
              <Box as="ul" pl={6} mb={3} style={{ listStyleType: "disc" }}>
                <li>Authentication controls</li>
                <li>Database access controls</li>
                <li>Row-Level Security where applicable</li>
                <li>Encrypted connections</li>
                <li>Access restrictions</li>
                <li>Security monitoring</li>
                <li>Secure application development practices</li>
              </Box>
              <Text>
                However, no internet-based service can guarantee absolute security. Users should also
                take reasonable steps to protect their account credentials and devices.
              </Text>
            </Box>

            <Separator borderColor="gray.200" />

            {/* Section 7 */}
            <Box>
              <Heading as="h2" fontSize={{ base: "xl", md: "22px" }} fontWeight="700" color="#07052A" mb={3}>
                7. Children's and Students' Privacy
              </Heading>
              <Text mb={3}>
                iGrades is an education platform intended to support students, including secondary-school students.
              </Text>
              <Text mb={3}>
                Because some users may be under the age of 18, we take student privacy seriously.
              </Text>
              <Text mb={3}>
                Where a user is a minor, use of iGrades should occur with the involvement, authorization,
                or supervision of a parent, guardian, school, or other authorized adult where required by
                applicable law or by the relevant iGrades account arrangement.
              </Text>
              <Text mb={3}>
                We do not intentionally collect more personal information from students than is reasonably necessary to provide the Service.
              </Text>
              <Text mb={3}>
                Parents or authorized guardians may contact us regarding information associated with a child's account where they have the appropriate authority to make such a request.
              </Text>
              <Text>
                If you believe a child has provided personal information to iGrades in circumstances
                where this was not authorized or appropriate, please contact us.
              </Text>
            </Box>

            <Separator borderColor="gray.200" />

            {/* Section 8 */}
            <Box>
              <Heading as="h2" fontSize={{ base: "xl", md: "22px" }} fontWeight="700" color="#07052A" mb={3}>
                8. Data Retention
              </Heading>
              <Text mb={2}>We retain information for as long as reasonably necessary to:</Text>
              <Box as="ul" pl={6} mb={3} style={{ listStyleType: "disc" }}>
                <li>Provide the Service</li>
                <li>Maintain user accounts</li>
                <li>Maintain learning and transaction records</li>
                <li>Provide customer support</li>
                <li>Resolve disputes</li>
                <li>Maintain security</li>
                <li>Comply with legal, accounting, or regulatory obligations</li>
              </Box>
              <Text mb={3}>
                Retention periods may vary depending on the type of information and the purpose for which it was collected.
              </Text>
              <Text>
                When information is no longer reasonably required, we may delete, anonymize, or otherwise
                securely dispose of it, subject to applicable legal and operational requirements.
              </Text>
            </Box>

            <Separator borderColor="gray.200" />

            {/* Section 9 */}
            <Box>
              <Heading as="h2" fontSize={{ base: "xl", md: "22px" }} fontWeight="700" color="#07052A" mb={3}>
                9. Account and Data Deletion
              </Heading>
              <Text mb={3}>
                Users may request deletion of their iGrades account and associated personal information,
                subject to applicable law and legitimate retention requirements.
              </Text>
              <Text mb={3}>
                Certain information may need to be retained for legal, security, fraud-prevention,
                financial, or other legitimate purposes.
              </Text>
              <Text>
                If you want to request account or personal-data deletion, contact us using the contact information provided below.
              </Text>
            </Box>

            <Separator borderColor="gray.200" />

            {/* Section 10 */}
            <Box>
              <Heading as="h2" fontSize={{ base: "xl", md: "22px" }} fontWeight="700" color="#07052A" mb={3}>
                10. Cookies and Similar Technologies
              </Heading>
              <Text mb={2}>
                iGrades may use cookies, local storage, session technologies, and similar mechanisms where necessary to:
              </Text>
              <Box as="ul" pl={6} mb={3} style={{ listStyleType: "disc" }}>
                <li>Keep users signed in</li>
                <li>Maintain preferences</li>
                <li>Support security</li>
                <li>Remember settings</li>
                <li>Understand how the Service is used</li>
                <li>Improve performance and functionality</li>
              </Box>
              <Text>
                The specific technologies used may change as the Service develops.
              </Text>
            </Box>

            <Separator borderColor="gray.200" />

            {/* Section 11 */}
            <Box>
              <Heading as="h2" fontSize={{ base: "xl", md: "22px" }} fontWeight="700" color="#07052A" mb={3}>
                11. Your Privacy Rights
              </Heading>
              <Text mb={2}>
                Depending on your location and applicable law, you may have rights relating to your personal information, including rights to:
              </Text>
              <Box as="ul" pl={6} mb={3} style={{ listStyleType: "disc" }}>
                <li>Request access to personal information</li>
                <li>Request correction of inaccurate information</li>
                <li>Request deletion of personal information</li>
                <li>Request information about how your information is processed</li>
                <li>Object to or restrict certain processing where applicable</li>
                <li>Withdraw consent where processing is based on consent</li>
                <li>Request additional information about third-party processing</li>
              </Box>
              <Text mb={3}>
                To exercise an applicable right, contact us using the details below.
              </Text>
              <Text>
                We may need to verify your identity or authority before fulfilling certain requests.
              </Text>
            </Box>

            <Separator borderColor="gray.200" />

            {/* Section 12 */}
            <Box>
              <Heading as="h2" fontSize={{ base: "xl", md: "22px" }} fontWeight="700" color="#07052A" mb={3}>
                12. International Data Processing
              </Heading>
              <Text mb={3}>
                Some of our service providers may process or store information in countries other than Nigeria.
              </Text>
              <Text>
                Where personal information is transferred internationally, we seek to use appropriate
                safeguards and contractual or other lawful mechanisms where required.
              </Text>
            </Box>

            <Separator borderColor="gray.200" />

            {/* Section 13 */}
            <Box>
              <Heading as="h2" fontSize={{ base: "xl", md: "22px" }} fontWeight="700" color="#07052A" mb={3}>
                13. Changes to This Privacy Policy
              </Heading>
              <Text mb={3}>
                We may update this Privacy Policy from time to time as iGrades develops, our practices change, or applicable laws require updates.
              </Text>
              <Text mb={3}>
                When we make material changes, we may provide appropriate notice through the Service or other reasonable communication channels.
              </Text>
              <Text>
                The updated version will include a revised effective date.
              </Text>
            </Box>

            <Separator borderColor="gray.200" />

            {/* Section 14 */}
            <Box bg="#F8FAFC" p={{ base: 4, sm: 6 }} borderRadius="xl" border="1px solid" borderColor="gray.200">
              <Heading as="h2" fontSize={{ base: "xl", md: "22px" }} fontWeight="700" color="#07052A" mb={3}>
                14. Contact Us
              </Heading>
              <Text mb={4}>
                If you have questions, concerns, or requests regarding this Privacy Policy or your personal
                information, please contact iGrades through the official contact channels provided on the
                iGrades website.
              </Text>
              <VStack align="start" gap={2} fontSize="sm">
                <Text>
                  <strong>Website:</strong>{" "}
                  <Link href="https://www.igrades.org/" target="_blank" rel="noopener noreferrer" color="#206CE1" fontWeight="600">
                    https://www.igrades.org/
                  </Link>
                </Text>
                <Text>
                  <strong>Privacy Policy:</strong>{" "}
                  <Link asChild color="#206CE1" fontWeight="600">
                    <RouterLink to="/privacy-policy">https://www.igrades.org/privacy-policy</RouterLink>
                  </Link>
                </Text>
                <Text>
                  <strong>Terms of Service:</strong>{" "}
                  <Link asChild color="#206CE1" fontWeight="600">
                    <RouterLink to="/terms-of-service">https://www.igrades.org/terms-of-service</RouterLink>
                  </Link>
                </Text>
                <Text>
                  <strong>Contact / Support:</strong>{" "}
                  <Link asChild color="#206CE1" fontWeight="600">
                    <RouterLink to="/contact">iGrades Help & Contact Centre</RouterLink>
                  </Link>
                </Text>
              </VStack>

              <Separator my={4} borderColor="gray.200" />

              <Text fontSize="xs" color="#64748B" fontWeight="600">
                Last Updated: September 12, 2026
              </Text>
            </Box>
          </VStack>
        </Box>
      </Container>

      <Footer />
    </Box>
  );
}
