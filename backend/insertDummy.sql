INSERT INTO users
(id, email, password, "fullName", "phoneNumber", address, "photoPath", role, "baseSalary", "managerId", "createdAt", "updatedAt")
VALUES
-- ADMIN (not inside staff tree)
(1, 'admin@company.com', 'hashed_admin_pw', 'Admin User', '081111111111', 'Head Office', NULL, 'admin', 25000000, NULL, NOW(), NOW()),

-- STAFF LEVEL 1 (top staff manager)
(2, 'director.staff@company.com', 'hashed_pw_2', 'Director Staff', '081111111112', 'Jakarta', NULL, 'staff', 18000000, NULL, NOW(), NOW()),

-- STAFF LEVEL 2 (managers under director staff)
(3, 'manager1@company.com', 'hashed_pw_3', 'Manager One', '081111111113', 'Jakarta', NULL, 'staff', 14000000, 2, NOW(), NOW()),
(4, 'manager2@company.com', 'hashed_pw_4', 'Manager Two', '081111111114', 'Bandung', NULL, 'staff', 14000000, 2, NOW(), NOW()),
(5, 'manager3@company.com', 'hashed_pw_5', 'Manager Three', '081111111115', 'Surabaya', NULL, 'staff', 14000000, 2, NOW(), NOW()),

-- STAFF LEVEL 3 (employees under manager1)
(6, 'staff1@company.com', 'hashed_pw_6', 'Staff One', '081111111116', 'Jakarta', NULL, 'staff', 8000000, 3, NOW(), NOW()),
(7, 'staff2@company.com', 'hashed_pw_7', 'Staff Two', '081111111117', 'Jakarta', NULL, 'staff', 7800000, 3, NOW(), NOW()),
(8, 'staff3@company.com', 'hashed_pw_8', 'Staff Three', '081111111118', 'Jakarta', NULL, 'staff', 7600000, 3, NOW(), NOW()),
(9, 'staff4@company.com', 'hashed_pw_9', 'Staff Four', '081111111119', 'Jakarta', NULL, 'staff', 7400000, 3, NOW(), NOW()),
(10, 'staff5@company.com', 'hashed_pw_10', 'Staff Five', '081111111120', 'Jakarta', NULL, 'staff', 7200000, 3, NOW(), NOW()),
(11, 'staff6@company.com', 'hashed_pw_11', 'Staff Six', '081111111121', 'Jakarta', NULL, 'staff', 7000000, 3, NOW(), NOW()),

-- STAFF LEVEL 3 (employees under manager2)
(12, 'staff7@company.com', 'hashed_pw_12', 'Staff Seven', '081111111122', 'Bandung', NULL, 'staff', 8200000, 4, NOW(), NOW()),
(13, 'staff8@company.com', 'hashed_pw_13', 'Staff Eight', '081111111123', 'Bandung', NULL, 'staff', 7900000, 4, NOW(), NOW()),
(14, 'staff9@company.com', 'hashed_pw_14', 'Staff Nine', '081111111124', 'Bandung', NULL, 'staff', 7700000, 4, NOW(), NOW()),
(15, 'staff10@company.com', 'hashed_pw_15', 'Staff Ten', '081111111125', 'Bandung', NULL, 'staff', 7500000, 4, NOW(), NOW()),
(16, 'staff11@company.com', 'hashed_pw_16', 'Staff Eleven', '081111111126', 'Bandung', NULL, 'staff', 7300000, 4, NOW(), NOW()),
(17, 'staff12@company.com', 'hashed_pw_17', 'Staff Twelve', '081111111127', 'Bandung', NULL, 'staff', 7100000, 4, NOW(), NOW()),

-- STAFF LEVEL 3 (employees under manager3)
(18, 'staff13@company.com', 'hashed_pw_18', 'Staff Thirteen', '081111111128', 'Surabaya', NULL, 'staff', 8100000, 5, NOW(), NOW()),
(19, 'staff14@company.com', 'hashed_pw_19', 'Staff Fourteen', '081111111129', 'Surabaya', NULL, 'staff', 7800000, 5, NOW(), NOW()),
(20, 'staff15@company.com', 'hashed_pw_20', 'Staff Fifteen', '081111111130', 'Surabaya', NULL, 'staff', 7600000, 5, NOW(), NOW()),
(21, 'staff16@company.com', 'hashed_pw_21', 'Staff Sixteen', '081111111131', 'Surabaya', NULL, 'staff', 7400000, 5, NOW(), NOW());

-- Add 4 more staff under manager1 to make total staff = 20
INSERT INTO users
(id, email, password, "fullName", "phoneNumber", address, "photoPath", role, "baseSalary", "managerId", "createdAt", "updatedAt")
VALUES
(22, 'staff17@company.com', 'hashed_pw_22', 'Staff Seventeen', '081111111132', 'Jakarta', NULL, 'staff', 7300000, 3, NOW(), NOW()),
(23, 'staff18@company.com', 'hashed_pw_23', 'Staff Eighteen', '081111111133', 'Jakarta', NULL, 'staff', 7200000, 3, NOW(), NOW()),
(24, 'staff19@company.com', 'hashed_pw_24', 'Staff Nineteen', '081111111134', 'Jakarta', NULL, 'staff', 7100000, 3, NOW(), NOW()),
(25, 'staff20@company.com', 'hashed_pw_25', 'Staff Twenty', '081111111135', 'Jakarta', NULL, 'staff', 7000000, 3, NOW(), NOW());