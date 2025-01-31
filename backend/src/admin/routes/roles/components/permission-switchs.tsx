import { Permission } from "../../../lib/types/role";
import {
  capitalize,
  curry,
  entries,
  filter,
  groupBy,
  isEqual,
  matchesProperty,
  negate,
  some,
  sortBy,
  uniqBy,
} from "lodash";
import { Label, Switch } from "@medusajs/ui";
import { REQUIRED_PERMISSIONS, uiMethodMapper } from "../../../lib/data/permissions";

type Props = {
  permissions: Permission[];
  selectedPermissions: Permission[];
  onChange: (permissions: Permission[]) => void;
};

function PermissionSwitches({ permissions, selectedPermissions, onChange }: Props) {
  const permissionsByName = groupBy(permissions, "name");

  function hasFullDomainAccess(name: string): boolean {
    const domainPermissions = sortBy(filter(permissions, { name }), "method");
    const selectedDomainPermissions = sortBy(filter(selectedPermissions, { name }), "method");

    return isEqual(domainPermissions, selectedDomainPermissions);
  }

  function uniqPermissions(permissions: Permission[]) {
    return uniqBy(permissions, (permission) => permission.name + permission.method);
  }

  const handleDomainSwitchChange = curry(function handleDomainSwitchChange(name: string, checked: boolean) {
    const newPermissions = (function () {
      if (checked) {
        return uniqPermissions([...selectedPermissions, ...filter(permissions, { name })]);
      }
      return filter(selectedPermissions, negate(matchesProperty("name", name)));
    })();

    onChange(newPermissions);
  });

  const handlePermissionSwitchChange = curry(function handlePermissionSwitchChange(
    permission: Permission,
    checked: boolean
  ) {
    const newPermissions = (function () {
      if (checked) {
        return uniqPermissions([...selectedPermissions, permission]);
      }
      return filter(selectedPermissions, negate(matchPermission(permission)));
    })();

    onChange(newPermissions);
  });

  function matchPermission(permission1: Permission) {
    return function match(permission2: Permission) {
      return permission1.name === permission2.name && permission1.method === permission2.method;
    };
  }

  return (
    <div className="space-y-3">
      {entries(permissionsByName).map(([name, permissions]) => (
        <div className="shadow-elevation-card-rest rounded-lg divide-y">
          <div key={name} className="flex items-center gap-x-3 p-3">
            <Switch id={name} checked={hasFullDomainAccess(name)} onCheckedChange={handleDomainSwitchChange(name)} />
            <Label htmlFor={name} className="font-bold capitalize">
              {name}
            </Label>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 p-3 gap-3">
            {permissions.map((permission) => (
              <div key={permission.method} className="flex items-center gap-x-3">
                <Switch
                  id={`${permission.name}_${permission.method}`}
                  checked={
                    some(selectedPermissions, matchPermission(permission)) ||
                    some(REQUIRED_PERMISSIONS, matchPermission(permission))
                  }
                  onCheckedChange={handlePermissionSwitchChange(permission)}
                  disabled={some(REQUIRED_PERMISSIONS, matchPermission(permission))}
                />
                <Label className="text-ui-fg-muted" htmlFor={`${permission.name}_${permission.method}`}>
                  {capitalize(uiMethodMapper[permission.method])}
                </Label>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default PermissionSwitches;
