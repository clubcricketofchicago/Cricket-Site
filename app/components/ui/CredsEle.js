export default function CredsEle({ setNum, setText }) {
  return (
    <div className="creds_ele">
      <div className="creds_num">
        <p className="roboto-condensed-bold brand_orange h3">{setNum}</p>
      </div>
      <div className="creds_text">
        <p className="roboto-condensed-regular p2 white_color">{setText}</p>
      </div>
    </div>
  );
}
