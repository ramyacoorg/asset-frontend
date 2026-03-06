Role: IT Administrator (Full access to manage inventory, users, and assignments)

Page: /dashboard (The main landing page after login)

Component: <Sidebar /> - Navigation links (Dashboard, Inventory, Assignments, Users, Reports)
Component: <TopNavbar /> - Shows logged-in admin profile, notification bell, and logout button
Component: <StatCards /> - 3 stat blocks showing Total Assets, Deployed Assets, and Broken/Under-Repair Assets
Component: <RecentAssignmentsTable /> - A mini-table showing the last 5 laptop assignments with employee name, asset tag, and date
Component: <LowStockAlert /> - A warning banner that appears when available laptops fall below a threshold

Page: /inventory (The page to view and manage all company laptops)

Component: <Sidebar /> - Reused from dashboard
Component: <TopNavbar /> - Reused from dashboard
Component: <InventoryDataTable /> - A large table listing all assets with columns for Asset Tag, Brand, Model, Status, Assigned To, and Location. Includes search, filter by status, and pagination
Component: <AddAssetModal /> - A popup form to add a new laptop to the database (brand, model, serial number, purchase date, status)
Component: <EditAssetModal /> - A popup form to edit an existing asset's details
Component: <DeleteAssetConfirmDialog /> - A confirmation dialog before deleting an asset
Component: <AssetStatusBadge /> - A colored badge showing asset status inside the table

Page: /assignments (The page to assign or unassign laptops to employees)

Component: <Sidebar /> - Reused from dashboard
Component: <TopNavbar /> - Reused from dashboard
Component: <AssignmentsTable /> - A table showing all active assignments with employee name, asset tag, assigned date, and an Unassign action button
Component: <AssignAssetModal /> - A popup form to assign a laptop to an employee
Component: <AssignmentHistoryDrawer /> - A slide-in panel showing the assignment history of an asset

Page: /users (The page to manage employee accounts)

Component: <Sidebar /> - Reused from dashboard
Component: <TopNavbar /> - Reused from dashboard
Component: <UsersTable /> - A table listing all employees with name, email, role, department, and status
Component: <AddUserModal /> - A popup form to create a new user account
Component: <EditUserModal /> - A popup form to update a user
Component: <DeactivateUserConfirmDialog /> - A confirmation dialog before deactivating a user

Page: /reports (The page to view asset and assignment reports)

Component: <Sidebar /> - Reused from dashboard
Component: <TopNavbar /> - Reused from dashboard
Component: <ReportFilterBar /> - A bar with date range picker and filter dropdowns
Component: <AssetSummaryChart /> - A chart showing assets by status (Available, Deployed, Under Repair)
Component: <AssignmentTrendChart /> - A line chart showing assignment trends
Component: <ExportReportButton /> - Button to export report as CSV or PDF

Page: /asset/:id (Detail page for a single asset)

Component: <Sidebar /> - Reused from dashboard
Component: <TopNavbar /> - Reused from dashboard
Component: <AssetDetailCard /> - Shows full asset details
Component: <AssignmentHistoryTimeline /> - Timeline showing asset assignment history
Component: <IssueTicketList /> - List of repair or issue tickets for the asset

Role: Standard Employee (Can only view assigned assets and report issues)

Page: /login (The entry point for users)

Component: <LoginForm /> - A login form with email and password
Component: <ErrorAlert /> - Shows login error if credentials are invalid

Page: /my-gear (Employee landing page)

Component: <TopNavbar /> - Shows employee name and logout button
Component: <MyAssetList /> - Grid of assets assigned to the employee
Component: <AssetDetailCard /> - Shows detailed asset information when clicked
Component: <ReportIssueButton /> - Button to report device issues
Component: <ReportIssueModal /> - Popup form for submitting issue details

Page: /my-tickets (Track reported issues)

Component: <TopNavbar /> - Reused navigation
Component: <MyTicketsTable /> - Table showing employee tickets and status
Component: <TicketStatusBadge /> - Badge showing ticket status

Role: IT Manager / Super Admin (Read-only access with approval capabilities)

Page: /dashboard (Same dashboard as IT Administrator)

Page: /approval-queue (Approve asset requests and escalations)

Component: <Sidebar /> - Reused sidebar with Approvals navigation
Component: <TopNavbar /> - Reused navigation
Component: <PendingRequestsTable /> - Table listing pending requests
Component: <ApproveRejectButtons /> - Approve or reject request actions
Component: <RequestDetailModal /> - Popup showing full request details