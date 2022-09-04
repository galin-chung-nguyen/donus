export const formatMessageTimeStamp = (d: Date): string => {
  let h: number = d.getHours();
  const m: number = d.getMinutes();
  const ampm = h >= 12 ? "PM" : "AM";

  h = h % 12;
  h = h ? h : 12; // the hour "0" should be "12"

  const hours: string = h.toString();
  const minutes: string = m < 10 ? "0" + m.toString() : m.toString();
  const strTime = hours + ":" + minutes + " " + ampm;
  return (
    d.getDate() +
    " " +
    new Intl.DateTimeFormat("en", { month: "short" }).format(d) +
    " " +
    d.getFullYear() +
    " " +
    strTime
  );
};
