export const LeaseDetails = ({ details }) => (
  <div className="grid gap-6 md:grid-cols-2">
    <Card title="Property">
      <Item label="Property" value={details.property} />
      <Item label="Unit" value={details.unit} />
      <Item label="Address" value={details.address} />
    </Card>

    <Card title="Lease Terms">
      <Row
        label="Start"
        value={new Date(details.startDate).toLocaleDateString()}
      />
      <Row label="End" value={new Date(details.endDate).toLocaleDateString()} />
      <Row label="Rent" value={`₦${details.monthlyRent.toLocaleString()}`} />
      <Row
        label="Deposit"
        value={`₦${details.securityDeposit.toLocaleString()}`}
      />
    </Card>

    <Card title="Management" full>
      <Item label="Company" value={details.landlord} />
      <Item label="Phone" value={details.landlordPhone} />
      <Item label="Email" value={details.landlordEmail} />
    </Card>
  </div>
);

const Card = ({ title, children, full }) => (
  <div
    className={`rounded-2xl bg-white dark:bg-gray-900/70 p-6 shadow-sm ${
      full ? "md:col-span-2" : ""
    }`}
  >
    <h3 className="font-medium mb-4 text-gray-900 dark:text-white">{title}</h3>
    <div className="space-y-4">{children}</div>
  </div>
);

const Item = ({ label, value }) => (
  <div>
    <p className="text-sm text-gray-500">{label}</p>
    <p className="font-medium text-gray-900 dark:text-white">{value}</p>
  </div>
);

const Row = ({ label, value }) => (
  <div className="flex justify-between">
    <span className="text-sm text-gray-500">{label}</span>
    <span className="font-medium text-gray-900 dark:text-white">{value}</span>
  </div>
);
