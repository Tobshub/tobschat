import { Link} from "react-router-dom";
import "@assets/friends.scss"
import { PropsWithChildren } from "react";

export function FriendComponent({friend, className, children}: PropsWithChildren & {friend: {username: string, publicId: string}, className?: string}) {
  return (
    <li className={`nav-item friend-component mb-3 ${className ?? ""}`}>
      <img src={`https://source.boringavatars.com/beam/40/${friend.publicId}`}/>
      <Link to={`/user/@/${friend.publicId}`}>{friend.username}</Link>
        {children}
    </li>
  )
}
