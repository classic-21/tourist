interface PlaceComponentDTO {
  place: string;
  description: string;
  last?: boolean;
}

import placeComponentStyles from "./syle.module.css";

export default function PlaceComponent({
  place,
  description,
  last = false,
}: PlaceComponentDTO) {
  return (
    <div
      className={`relative h-100 w-100 border-l-2 ${placeComponentStyles.container}`}
      style={last ? { border: "none !important" } : {}}
    >
      <div className="absolute top-[0px] bottom-0 right-0 left-[-11px] rounded-[50%] bg-[#D9D9D9] h-[20px] w-[20px]"></div>
      <div className="pl-5 mt-[-2px] text-[#434343]">{place}</div>
      <div className="pl-5 text-[#666666]">{description}</div>
      {!last ? (
        <>
          <br />
          <br />
        </>
      ) : null}
    </div>
  );
}
