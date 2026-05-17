ISO27001_CONTROLS = {
    "A.5.1.1": {
        "title": "Policies for Information Security",
        "criteria": "A set of policies for information security shall be defined, approved by management, published and communicated to employees and relevant external parties.",
        "testing_procedure": "Obtain the information security policy and verify that it is approved by management, includes a commitment to continual improvement, and is communicated to all employees."
    },
    "A.5.1.2": {
        "title": "Review of the Policies for Information Security",
        "criteria": "The policies for information security shall be reviewed at planned intervals or if significant changes occur to ensure their continuing suitability, adequacy and effectiveness.",
        "testing_procedure": "Review policy review records and meeting minutes to confirm that the information security policy is reviewed at planned intervals (at least annually) and updated as necessary."
    },
    "A.6.1.1": {
        "title": "Information Security Roles and Responsibilities",
        "criteria": "All information security responsibilities shall be defined and allocated.",
        "testing_procedure": "Examine job descriptions, organisational charts, and responsibility assignment documents to verify that information security roles are clearly defined."
    },
    "A.6.1.2": {
        "title": "Segregation of Duties",
        "criteria": "Conflicting duties and conflicting areas of responsibility shall be segregated.",
        "testing_procedure": "Review access control matrices and transaction approval workflows to confirm that no single individual can both initiate and approve a sensitive transaction."
    },
    "A.7.2.1": {
        "title": "Management Responsibilities",
        "criteria": "Management shall require all employees and contractors to apply information security in accordance with the established policies and procedures of the organisation.",
        "testing_procedure": "Inspect employment contracts, contractor agreements, and acknowledgement forms to ensure that information security responsibilities are included."
    },
    "A.7.2.2": {
        "title": "Information Security Awareness, Education and Training",
        "criteria": "All employees of the organisation and, where relevant, contractors shall receive appropriate awareness education and training and regular updates in organisational policies and procedures, as relevant for their job function.",
        "testing_procedure": "Select a sample of employees and verify that they have completed the required information security awareness training within the specified timeframe."
    },
    "A.8.1.1": {
        "title": "Inventory of Assets",
        "criteria": "All assets shall be clearly identified and an inventory of all important assets shall be drawn up and maintained.",
        "testing_procedure": "Examine the asset inventory and verify that it includes all relevant information (owner, classification, location) and is updated regularly."
    },
    "A.8.1.2": {
        "title": "Ownership of Assets",
        "criteria": "Assets maintained in the inventory shall be owned.",
        "testing_procedure": "Review the asset inventory for assigned ownership and confirm with asset owners that they understand their responsibilities."
    },
    "A.8.2.1": {
        "title": "Classification of Information",
        "criteria": "Information shall be classified in terms of legal requirements, value, criticality and sensitivity to unauthorised disclosure or modification.",
        "testing_procedure": "Obtain the data classification policy and verify that classification levels are defined and applied consistently to all information assets."
    },
    "A.9.1.1": {
        "title": "Access Control Policy",
        "criteria": "An access control policy shall be established, documented and reviewed based on business and information security requirements.",
        "testing_procedure": "Examine the access control policy and verify that it covers user registration, privilege management, and user access reviews."
    },
    "A.9.2.1": {
        "title": "User Registration and De-registration",
        "criteria": "A formal user registration and de-registration process shall be implemented to enable assignment of access rights.",
        "testing_procedure": "Review user access request and termination records to ensure that accounts are created, modified, and disabled in a timely manner."
    },
    "A.9.2.2": {
        "title": "User Access Provisioning",
        "criteria": "A formal user access provisioning process shall be implemented to assign or revoke access rights for all user types to all systems and services.",
        "testing_procedure": "Inspect access request forms, approval records, and access logs for a sample of users to verify that access rights are granted according to job requirements."
    },
    "A.9.2.3": {
        "title": "Management of Privileged Access Rights",
        "criteria": "The allocation and use of privileged access rights shall be restricted and controlled.",
        "testing_procedure": "Obtain a list of privileged accounts and verify that they are limited to a few authorised individuals, require additional authentication, and are regularly reviewed."
    },
    "A.9.4.1": {
        "title": "Information Access Restriction",
        "criteria": "Access to information and application system functions shall be restricted in accordance with the access control policy.",
        "testing_procedure": "Test a sample of user accounts to confirm that access rights are configured in line with the access control policy and job requirements."
    },
    "A.10.1.1": {
        "title": "Policy on the Use of Cryptographic Controls",
        "criteria": "A policy on the use of cryptographic controls for protection of information shall be developed and implemented.",
        "testing_procedure": "Obtain the cryptographic control policy and verify that encryption standards, key management procedures, and approved algorithms are defined."
    },
    "A.11.1.1": {
        "title": "Physical Security Perimeter",
        "criteria": "Security perimeters shall be defined and used to protect areas that contain either sensitive or critical information and information processing facilities.",
        "testing_procedure": "Inspect the physical security perimeter (e.g., walls, card-controlled entry gates) and review records of access to sensitive areas."
    },
    "A.12.1.1": {
        "title": "Documented Operating Procedures",
        "criteria": "Operating procedures shall be documented and made available to all users who need them.",
        "testing_procedure": "Obtain the documented operating procedures for key systems and verify that they are up to date and accessible to relevant personnel."
    },
    "A.12.1.2": {
        "title": "Change Management",
        "criteria": "Changes to the organisation, business processes, information processing facilities and systems that affect information security shall be controlled.",
        "testing_procedure": "Select a sample of recent changes and review change request forms, testing documentation, and approval records."
    },
    "A.12.6.1": {
        "title": "Management of Technical Vulnerabilities",
        "criteria": "Information about technical vulnerabilities of information systems being used shall be obtained in a timely fashion, the organisation's exposure to such vulnerabilities evaluated and appropriate measures taken to address the associated risk.",
        "testing_procedure": "Review vulnerability scan reports and patch management records to verify that vulnerabilities are identified and remediated within defined SLAs."
    },
    "A.13.1.1": {
        "title": "Network Controls",
        "criteria": "Networks shall be managed and controlled to protect information in systems and applications.",
        "testing_procedure": "Inspect network diagrams, firewall rule sets, and network monitoring configurations."
    },
    "A.14.2.1": {
        "title": "Secure Development Policy",
        "criteria": "Rules for the development of software and systems shall be established and applied to developments within the organisation.",
        "testing_procedure": "Examine the secure development policy and verify that it covers secure coding standards, code reviews, and security testing requirements."
    },
    "A.15.1.1": {
        "title": "Information Security Policy for Supplier Relationships",
        "criteria": "Information security requirements for mitigating the risks associated with supplier's access to the organisation's assets shall be agreed with the supplier and documented.",
        "testing_procedure": "Review supplier contracts and verify that information security requirements are included and that supplier risk assessments are performed."
    },
    "A.16.1.1": {
        "title": "Responsibilities and Procedures",
        "criteria": "Management responsibilities and procedures shall be established to ensure a quick, effective and orderly response to information security incidents.",
        "testing_procedure": "Obtain the incident response policy and test it by simulating an incident to verify that the response team is notified and procedures are followed."
    },
    "A.17.1.1": {
        "title": "Planning Information Security Continuity",
        "criteria": "The organisation shall determine its requirements for information security and the continuity of information security management in adverse situations, e.g. during a crisis or disaster.",
        "testing_procedure": "Review the business continuity plan and verify that information security requirements are incorporated and tested periodically."
    },
    "A.18.1.1": {
        "title": "Identification of Applicable Legislation and Contractual Requirements",
        "criteria": "All relevant legislative statutory, regulatory, contractual requirements and the organisation's approach to meet these requirements shall be explicitly identified, documented and kept up to date for each information system and the organisation.",
        "testing_procedure": "Obtain the legal and regulatory compliance register and verify that it is reviewed and updated regularly."
    },
}