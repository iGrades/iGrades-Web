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
import { FiFileText, FiArrowLeft, FiClock } from "react-icons/fi";
import NavBar from "./LandingPage/navBar";
import Footer from "./LandingPage/footer";

export default function TermsOfService() {
  useEffect(() => {
    document.title = "iGrades Terms of Service";
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
      "Read the official iGrades Terms of Service governing your access to and use of the iGrades learning platform, content, subscriptions, rewards, and related educational services."
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
              <FiFileText size={13} /> Official Legal Terms
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
            iGrades Terms of Service
          </Heading>

          <Text fontSize={{ base: "sm", md: "md" }} color="#475569" maxW="2xl" lineHeight="1.6">
            These Terms of Service govern your access to and use of the iGrades website, applications,
            learning platform, content, features, subscriptions, rewards, and related services.
          </Text>

          <HStack mt={5} gap={4} fontSize="xs" color="#64748B" flexWrap="wrap">
            <Link
              asChild
              color="#206CE1"
              fontWeight="600"
              _hover={{ textDecoration: "underline" }}
            >
              <RouterLink to="/privacy-policy">
                View Privacy Policy &rarr;
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
              <Text mb={3} fontSize="lg" fontWeight="700" color="#07052A">
                Welcome to iGrades.
              </Text>
              <Text mb={3}>
                These Terms of Service ("Terms") govern your access to and use of the iGrades website,
                applications, learning platform, content, features, subscriptions, rewards, and related
                services (collectively, the "Service").
              </Text>
              <Text mb={3}>
                By creating an account or using iGrades, you agree to these Terms. If you do not agree
                with these Terms, you should not use the Service.
              </Text>
              <Text fontWeight="500" color="#0F172A">
                If you are using iGrades on behalf of a student who is a minor, you confirm that you are
                authorized to do so as a parent, guardian, school representative, or other responsible adult
                where applicable.
              </Text>
            </Box>

            <Separator borderColor="gray.200" />

            {/* Section 1 */}
            <Box>
              <Heading as="h2" fontSize={{ base: "xl", md: "22px" }} fontWeight="700" color="#07052A" mb={3}>
                1. About iGrades
              </Heading>
              <Text mb={2}>
                iGrades is a digital learning platform designed to help students:
              </Text>
              <Box as="ul" pl={6} mb={3} style={{ listStyleType: "disc" }}>
                <li>Learn academic concepts</li>
                <li>Practice through quizzes and exercises</li>
                <li>Understand difficult topics</li>
                <li>Track academic progress</li>
                <li>Develop consistent study habits</li>
                <li>Receive personalized learning support</li>
                <li>Prepare for relevant examinations</li>
              </Box>
              <Text mb={3}>
                iGrades may support preparation for examinations such as WAEC, NECO, JAMB, A-Level
                examinations, and other educational assessments.
              </Text>
              <Text fontStyle="italic" color="#475569">
                However, iGrades is a learning support platform and does not guarantee examination results,
                admission outcomes, grades, scholarships, or other academic outcomes.
              </Text>
            </Box>

            <Separator borderColor="gray.200" />

            {/* Section 2 */}
            <Box>
              <Heading as="h2" fontSize={{ base: "xl", md: "22px" }} fontWeight="700" color="#07052A" mb={3}>
                2. Eligibility and Student Accounts
              </Heading>
              <Text mb={3}>
                Users must provide accurate information when creating an account.
              </Text>
              <Text mb={3}>
                If you are under the age at which you can legally agree to these Terms in your jurisdiction,
                you should use iGrades only with the involvement and authorization of a parent, guardian,
                school, or other authorized adult where required.
              </Text>
              <Text mb={3}>
                Users are responsible for maintaining the confidentiality of their account credentials and
                for activity conducted through their accounts.
              </Text>
              <Text fontWeight="600" color="#0F172A" mb={2}>
                You must not:
              </Text>
              <Box as="ul" pl={6} style={{ listStyleType: "disc" }}>
                <li>Share your account credentials with unauthorized individuals</li>
                <li>Impersonate another person</li>
                <li>Create accounts using false information</li>
                <li>Attempt to gain unauthorized access to another account</li>
                <li>Use another user's account without authorization</li>
              </Box>
            </Box>

            <Separator borderColor="gray.200" />

            {/* Section 3 */}
            <Box>
              <Heading as="h2" fontSize={{ base: "xl", md: "22px" }} fontWeight="700" color="#07052A" mb={3}>
                3. Google Sign-In
              </Heading>
              <Text mb={3}>
                iGrades may allow users to authenticate using Google Sign-In.
              </Text>
              <Text mb={3}>
                When using Google Sign-In, you authorize iGrades to receive the information made available
                through Google's authentication process as described in our Privacy Policy.
              </Text>
              <Text>
                Your use of Google authentication is also subject to Google's applicable terms and policies.
              </Text>
            </Box>

            <Separator borderColor="gray.200" />

            {/* Section 4 */}
            <Box>
              <Heading as="h2" fontSize={{ base: "xl", md: "22px" }} fontWeight="700" color="#07052A" mb={3}>
                4. Learning Content
              </Heading>
              <Text mb={2}>
                iGrades provides educational content including, depending on the Service:
              </Text>
              <Box as="ul" pl={6} mb={3} style={{ listStyleType: "disc" }}>
                <li>Lessons</li>
                <li>Explanations</li>
                <li>Videos</li>
                <li>Quizzes</li>
                <li>Practice questions</li>
                <li>Study materials</li>
                <li>Learning recommendations</li>
                <li>AI-assisted educational support</li>
              </Box>
              <Text mb={3}>
                Content is provided for educational purposes.
              </Text>
              <Text mb={3}>
                Although we aim to maintain accurate and useful educational content, no educational
                platform can guarantee that every piece of content will always be completely error-free or current.
              </Text>
              <Text>
                Students should use appropriate textbooks, official examination materials, teachers,
                schools, and other authoritative educational resources where appropriate.
              </Text>
            </Box>

            <Separator borderColor="gray.200" />

            {/* Section 5 */}
            <Box>
              <Heading as="h2" fontSize={{ base: "xl", md: "22px" }} fontWeight="700" color="#07052A" mb={3}>
                5. AI and Spark
              </Heading>
              <Text mb={3}>
                iGrades may provide an AI-powered learning companion known as Spark.
              </Text>
              <Text mb={3}>
                Spark is intended to help students understand concepts, think through problems, receive
                explanations, and develop stronger learning habits.
              </Text>
              <Text mb={3}>
                AI-generated responses may occasionally contain inaccurate, incomplete, or inappropriate information.
              </Text>
              <Text mb={3}>
                Users should therefore exercise judgment and verify important academic information against
                appropriate authoritative sources.
              </Text>
              <Text fontWeight="600" color="#0F172A">
                Spark does not replace teachers, schools, parents, tutors, counselors, or other qualified professionals.
              </Text>
            </Box>

            <Separator borderColor="gray.200" />

            {/* Section 6 */}
            <Box>
              <Heading as="h2" fontSize={{ base: "xl", md: "22px" }} fontWeight="700" color="#07052A" mb={3}>
                6. Subscriptions and Payments
              </Heading>
              <Text mb={3}>
                Certain iGrades features may require a paid subscription.
              </Text>
              <Text mb={3}>
                Subscription plans, prices, billing periods, and available features will be presented
                through the Service at the time of purchase.
              </Text>
              <Text mb={3}>
                Depending on the applicable plan, subscriptions may be offered on a termly, annual, or other stated billing basis.
              </Text>
              <Text mb={3}>
                By purchasing a subscription, you authorize the applicable payment provider to process the
                transaction according to the selected payment method.
              </Text>
              <Text>
                Subscription access may be limited, suspended, or terminated if payment is unsuccessful,
                reversed, refunded, or otherwise not completed.
              </Text>
            </Box>

            <Separator borderColor="gray.200" />

            {/* Section 7 */}
            <Box>
              <Heading as="h2" fontSize={{ base: "xl", md: "22px" }} fontWeight="700" color="#07052A" mb={3}>
                7. iGG Points
              </Heading>
              <Text mb={3}>
                iGrades includes a rewards system known as <strong>iGG Points</strong>.
              </Text>
              <Text mb={4}>
                iGG Points are promotional/reward points provided within the iGrades platform for qualifying learning activity.
              </Text>

              <Box bg="#F8FAFC" p={{ base: 4, sm: 6 }} borderRadius="xl" border="1px solid" borderColor="gray.200" mb={4}>
                <Heading as="h3" fontSize={{ base: "md", md: "17px" }} fontWeight="700" color="#1E293B" mb={2}>
                  Earning iGG Points
                </Heading>
                <Text mb={2}>Subject to the applicable rules:</Text>
                <Box as="ul" pl={6} mb={3} style={{ listStyleType: "disc" }}>
                  <li>Daily login: <strong>5 points once per day</strong></li>
                  <li>Quiz score of 80% or higher on a first attempt: <strong>30 points</strong></li>
                  <li>Quiz score of 50–79% on a first attempt: <strong>20 points</strong></li>
                  <li>Quiz score below 50% on a first attempt: <strong>10 points</strong></li>
                  <li>7-day streak milestone: <strong>50 bonus points</strong></li>
                  <li>30-day streak milestone: <strong>250 bonus points</strong></li>
                </Box>
                <Text mb={2}>
                  Retaking an already completed quiz does not generate additional quiz-completion points.
                </Text>
                <Text mb={2}>
                  Daily login and quiz rewards are subject to a maximum of <strong>100 points per day</strong>.
                </Text>
                <Text mb={2}>
                  Streak milestone bonuses are not subject to the daily 100-point cap.
                </Text>
                <Text fontWeight="600" color="#206CE1">
                  Daily activity is calculated using West Africa Time (UTC+1).
                </Text>
              </Box>
            </Box>

            <Separator borderColor="gray.200" />

            {/* Section 8 */}
            <Box>
              <Heading as="h2" fontSize={{ base: "xl", md: "22px" }} fontWeight="700" color="#07052A" mb={3}>
                8. Streak Protection
              </Heading>
              <Text mb={3}>
                iGrades may provide streak protection under the applicable iGG Points rules.
              </Text>
              <Text mb={3}>
                One missed day may be automatically protected within a seven-day rolling window so that an
                accidental missed day does not immediately reset a qualifying learning streak.
              </Text>
              <Text>
                iGrades may update the technical implementation of streak tracking while preserving the applicable reward rules.
              </Text>
            </Box>

            <Separator borderColor="gray.200" />

            {/* Section 9 */}
            <Box>
              <Heading as="h2" fontSize={{ base: "xl", md: "22px" }} fontWeight="700" color="#07052A" mb={3}>
                9. iGG Points Expiry
              </Heading>
              <Text mb={3}>
                iGG Points are valid for a rolling period of <strong>12 months from the month in which they are earned</strong>,
                after which unused eligible points may expire.
              </Text>
              <Text>
                Users are responsible for reviewing their available points and applicable expiry information within the Service.
              </Text>
            </Box>

            <Separator borderColor="gray.200" />

            {/* Section 10 */}
            <Box>
              <Heading as="h2" fontSize={{ base: "xl", md: "22px" }} fontWeight="700" color="#07052A" mb={3}>
                10. Converting iGG Points to Store Credit
              </Heading>
              <Text mb={3}>
                Eligible users may convert iGG Points into iGrades store credit.
              </Text>
              <Box bg="#EBF3FF" p={4} borderRadius="xl" border="1px solid #BFDBFE" mb={4}>
                <Text fontWeight="700" color="#1D4ED8" mb={1}>
                  The current conversion rate is:
                </Text>
                <Text fontSize="lg" fontWeight="800" color="#1E40AF" mb={1}>
                  100 iGG Points = ₦1,000 store credit
                </Text>
                <Text fontSize="sm" color="#1E3A8A">
                  This means: <strong>1 iGG Point = ₦10 of store credit.</strong>
                </Text>
              </Box>
              <Text mb={3}>
                The minimum conversion is <strong>100 points</strong>, and conversions must be made in increments of 100 points.
              </Text>
              <Text mb={2}>For example, eligible conversions may include:</Text>
              <Box as="ul" pl={6} mb={3} style={{ listStyleType: "disc" }}>
                <li>100 points → ₦1,000</li>
                <li>200 points → ₦2,000</li>
                <li>500 points → ₦5,000</li>
                <li>1,000 points → ₦10,000</li>
              </Box>
              <Text>
                Store credit is intended to be applied toward eligible iGrades subscription invoices,
                including applicable termly or annual subscription charges.
              </Text>
            </Box>

            <Separator borderColor="gray.200" />

            {/* Section 11 */}
            <Box>
              <Heading as="h2" fontSize={{ base: "xl", md: "22px" }} fontWeight="700" color="#07052A" mb={3}>
                11. Store Credit
              </Heading>
              <Text mb={3}>
                Store credit is distinct from iGG Points.
              </Text>
              <Text mb={3}>
                Once iGG Points have been converted into store credit, the converted value may be applied
                to eligible upcoming subscription invoices according to the applicable iGrades rules.
              </Text>
              <Text fontWeight="600" color="#0F172A" mb={2}>
                Store credit:
              </Text>
              <Box as="ul" pl={6} mb={3} style={{ listStyleType: "disc" }}>
                <li>Is not intended to function as cash</li>
                <li>Is not a bank balance</li>
                <li>Is not a general-purpose payment instrument</li>
                <li>Is not ordinarily redeemable for cash</li>
                <li>May not be transferred between accounts unless iGrades expressly permits it</li>
              </Box>
              <Text>
                iGrades may refuse, reverse, or investigate transactions involving suspected fraud, abuse,
                manipulation, or technical errors.
              </Text>
            </Box>

            <Separator borderColor="gray.200" />

            {/* Section 12 */}
            <Box>
              <Heading as="h2" fontSize={{ base: "xl", md: "22px" }} fontWeight="700" color="#07052A" mb={3}>
                12. Fair Use of Rewards
              </Heading>
              <Text mb={3}>
                Users must not attempt to manipulate the iGG Points system.
              </Text>
              <Text fontWeight="600" color="#0F172A" mb={2}>
                Prohibited conduct includes attempting to obtain rewards through:
              </Text>
              <Box as="ul" pl={6} mb={3} style={{ listStyleType: "disc" }}>
                <li>Automated scripts or bots</li>
                <li>Fake accounts</li>
                <li>Account sharing</li>
                <li>Exploitation of technical vulnerabilities</li>
                <li>Repeated actions designed to bypass first-attempt restrictions</li>
                <li>Fraudulent activity</li>
                <li>Attempts to circumvent daily limits</li>
                <li>Unauthorized modification of requests or application data</li>
              </Box>
              <Text>
                If we reasonably believe rewards have been obtained through abuse, fraud, technical
                exploitation, or other prohibited activity, we may investigate and take appropriate
                action, including adjusting or removing improperly obtained rewards or restricting the account.
              </Text>
            </Box>

            <Separator borderColor="gray.200" />

            {/* Section 13 */}
            <Box>
              <Heading as="h2" fontSize={{ base: "xl", md: "22px" }} fontWeight="700" color="#07052A" mb={3}>
                13. Intellectual Property
              </Heading>
              <Text mb={3}>
                The iGrades Service and its content, including software, branding, logos, graphics, interface
                designs, educational materials, text, original media, and other protected materials, are
                owned by or licensed to iGrades unless otherwise stated.
              </Text>
              <Text mb={3}>
                You may use the Service for its intended educational purposes.
              </Text>
              <Text>
                You may not reproduce, redistribute, sell, publicly exploit, reverse engineer, modify,
                or commercially exploit iGrades content or software without appropriate authorization.
              </Text>
            </Box>

            <Separator borderColor="gray.200" />

            {/* Section 14 */}
            <Box>
              <Heading as="h2" fontSize={{ base: "xl", md: "22px" }} fontWeight="700" color="#07052A" mb={3}>
                14. User Content
              </Heading>
              <Text mb={3}>
                Where iGrades allows users to submit content, including questions, feedback, messages,
                or other materials, you remain responsible for the content you submit.
              </Text>
              <Text fontWeight="600" color="#0F172A" mb={2}>
                You must not submit content that:
              </Text>
              <Box as="ul" pl={6} mb={3} style={{ listStyleType: "disc" }}>
                <li>Is unlawful</li>
                <li>Infringes another person's rights</li>
                <li>Contains malicious software</li>
                <li>Attempts to compromise the Service</li>
                <li>Harasses or abuses others</li>
                <li>Contains information you are not authorized to disclose</li>
              </Box>
              <Text>
                By submitting content to features that require iGrades to process it to provide the Service,
                you grant iGrades the permissions reasonably necessary to host, process, display, and use that
                content for the relevant Service functionality.
              </Text>
            </Box>

            <Separator borderColor="gray.200" />

            {/* Section 15 */}
            <Box>
              <Heading as="h2" fontSize={{ base: "xl", md: "22px" }} fontWeight="700" color="#07052A" mb={3}>
                15. Acceptable Use
              </Heading>
              <Text mb={2}>You agree to use iGrades lawfully and responsibly.</Text>
              <Text fontWeight="600" color="#0F172A" mb={2}>
                You must not:
              </Text>
              <Box as="ul" pl={6} style={{ listStyleType: "disc" }}>
                <li>Attempt to disrupt the Service</li>
                <li>Attack or compromise our systems</li>
                <li>Circumvent security controls</li>
                <li>Access restricted areas without authorization</li>
                <li>Scrape or systematically copy protected content without permission</li>
                <li>Introduce malware or malicious code</li>
                <li>Abuse other users</li>
                <li>Use the platform for fraudulent purposes</li>
                <li>Attempt to manipulate subscriptions, rewards, or account systems</li>
              </Box>
            </Box>

            <Separator borderColor="gray.200" />

            {/* Section 16 */}
            <Box>
              <Heading as="h2" fontSize={{ base: "xl", md: "22px" }} fontWeight="700" color="#07052A" mb={3}>
                16. Availability and Changes to the Service
              </Heading>
              <Text mb={3}>
                We aim to keep iGrades available and reliable, but we do not guarantee that the Service will
                always be uninterrupted, error-free, or available.
              </Text>
              <Text mb={2}>We may:</Text>
              <Box as="ul" pl={6} mb={3} style={{ listStyleType: "disc" }}>
                <li>Add features</li>
                <li>Remove features</li>
                <li>Modify functionality</li>
                <li>Update educational content</li>
                <li>Perform maintenance</li>
                <li>Temporarily suspend portions of the Service</li>
                <li>Change technical infrastructure</li>
              </Box>
              <Text>
                Where appropriate, we will provide reasonable notice of material changes.
              </Text>
            </Box>

            <Separator borderColor="gray.200" />

            {/* Section 17 */}
            <Box>
              <Heading as="h2" fontSize={{ base: "xl", md: "22px" }} fontWeight="700" color="#07052A" mb={3}>
                17. Account Suspension or Termination
              </Heading>
              <Text mb={2}>
                We may suspend or terminate an account where reasonably necessary, including when:
              </Text>
              <Box as="ul" pl={6} mb={3} style={{ listStyleType: "disc" }}>
                <li>These Terms are violated</li>
                <li>The account is used fraudulently</li>
                <li>The account is involved in abuse or security threats</li>
                <li>The user attempts to manipulate iGG Points</li>
                <li>The user attempts unauthorized access</li>
                <li>Required payments are not completed</li>
                <li>We are legally required to do so</li>
              </Box>
              <Text>
                Where appropriate, we may provide notice and an opportunity to resolve the issue.
              </Text>
            </Box>

            <Separator borderColor="gray.200" />

            {/* Section 18 */}
            <Box>
              <Heading as="h2" fontSize={{ base: "xl", md: "22px" }} fontWeight="700" color="#07052A" mb={3}>
                18. Educational Disclaimer
              </Heading>
              <Text mb={3}>
                iGrades is designed as an educational support platform.
              </Text>
              <Text mb={2}>Using iGrades does not guarantee:</Text>
              <Box as="ul" pl={6} mb={3} style={{ listStyleType: "disc" }}>
                <li>A particular examination score</li>
                <li>Passing an examination</li>
                <li>Admission to a school or institution</li>
                <li>A scholarship</li>
                <li>Academic promotion</li>
                <li>Any other specific educational outcome</li>
              </Box>
              <Text>
                Students remain responsible for their overall preparation and should use appropriate
                official examination information and educational guidance.
              </Text>
            </Box>

            <Separator borderColor="gray.200" />

            {/* Section 19 */}
            <Box>
              <Heading as="h2" fontSize={{ base: "xl", md: "22px" }} fontWeight="700" color="#07052A" mb={3}>
                19. Third-Party Services
              </Heading>
              <Text mb={3}>
                iGrades may integrate with third-party services such as authentication providers, cloud
                infrastructure providers, AI services, payment providers, email services, and other technology providers.
              </Text>
              <Text mb={3}>
                Third-party services may have their own terms and privacy policies.
              </Text>
              <Text>
                iGrades is not responsible for independent changes to third-party services outside our control.
              </Text>
            </Box>

            <Separator borderColor="gray.200" />

            {/* Section 20 */}
            <Box>
              <Heading as="h2" fontSize={{ base: "xl", md: "22px" }} fontWeight="700" color="#07052A" mb={3}>
                20. Limitation of Liability
              </Heading>
              <Text mb={3}>
                To the extent permitted by applicable law, iGrades will not be responsible for indirect,
                incidental, consequential, or special losses arising from use of the Service.
              </Text>
              <Text>
                Nothing in these Terms is intended to exclude or limit liability where such exclusion or
                limitation is prohibited by applicable law.
              </Text>
            </Box>

            <Separator borderColor="gray.200" />

            {/* Section 21 */}
            <Box>
              <Heading as="h2" fontSize={{ base: "xl", md: "22px" }} fontWeight="700" color="#07052A" mb={3}>
                21. Privacy
              </Heading>
              <Text mb={3}>
                Your use of iGrades is also governed by our Privacy Policy.
              </Text>
              <Text mb={3}>
                The Privacy Policy explains how we collect and process personal information, including
                information associated with Google Sign-In, student learning activity, parent accounts,
                subscriptions, and AI-powered features.
              </Text>
              <Box bg="#F8FAFC" p={4} borderRadius="xl" border="1px solid" borderColor="gray.200">
                <Text fontWeight="600" color="#0F172A" mb={1}>
                  Privacy Policy:
                </Text>
                <Link asChild color="#206CE1" fontWeight="700">
                  <RouterLink to="/privacy-policy">https://www.igrades.org/privacy-policy</RouterLink>
                </Link>
              </Box>
            </Box>

            <Separator borderColor="gray.200" />

            {/* Section 22 */}
            <Box>
              <Heading as="h2" fontSize={{ base: "xl", md: "22px" }} fontWeight="700" color="#07052A" mb={3}>
                22. Changes to These Terms
              </Heading>
              <Text mb={3}>
                We may update these Terms from time to time.
              </Text>
              <Text mb={3}>
                When material changes are made, we may provide reasonable notice through the Service or other
                appropriate communication channels.
              </Text>
              <Text>
                Your continued use of iGrades after updated Terms become effective constitutes acceptance
                of the updated Terms to the extent permitted by applicable law.
              </Text>
            </Box>

            <Separator borderColor="gray.200" />

            {/* Section 23 */}
            <Box>
              <Heading as="h2" fontSize={{ base: "xl", md: "22px" }} fontWeight="700" color="#07052A" mb={3}>
                23. Governing Law
              </Heading>
              <Text mb={3}>
                These Terms shall be interpreted in accordance with applicable laws and regulations.
              </Text>
              <Text>
                Where legally applicable, disputes relating to the Service will be subject to the appropriate
                courts and legal framework having jurisdiction over the relevant matter.
              </Text>
            </Box>

            <Separator borderColor="gray.200" />

            {/* Section 24 */}
            <Box bg="#F8FAFC" p={{ base: 4, sm: 6 }} borderRadius="xl" border="1px solid" borderColor="gray.200">
              <Heading as="h2" fontSize={{ base: "xl", md: "22px" }} fontWeight="700" color="#07052A" mb={3}>
                24. Contact Us
              </Heading>
              <Text mb={4}>
                If you have questions about these Terms or the iGrades Service, please contact us through
                the official contact channels provided on the iGrades website.
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
