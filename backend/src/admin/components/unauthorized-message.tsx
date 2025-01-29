import { Alert } from "@medusajs/ui";
import { Resource } from "../lib/data/permissions";

const UnauthorizedMessage = ({ resource }: { resource: Resource }) => {
  return (
    <Alert className="items-center bg-red-100" variant="error">
      You are not authorized to access {resource}.
    </Alert>
  );
};

export default UnauthorizedMessage;
