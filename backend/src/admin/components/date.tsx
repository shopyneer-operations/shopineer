import { Tooltip } from "@medusajs/ui";
import { format } from "date-fns/format";

const DateCell = ({ date, className }: { date: Date | string; className?: string }) => {
  const value = new Date(date);
  value.setMinutes(value.getMinutes() - value.getTimezoneOffset());

  const hour12 = Intl.DateTimeFormat().resolvedOptions().hour12;
  const timestampFormat = hour12 ? "dd MMM yyyy hh:MM a" : "dd MMM yyyy HH:MM";

  return (
    <div className={className}>
      <Tooltip className="z-10" content={<span className="text-pretty">{`${format(value, timestampFormat)}`}</span>}>
        <span className="truncate">{format(value, "dd MMM yyyy")}</span>
      </Tooltip>
    </div>
  );
};

export default DateCell;
