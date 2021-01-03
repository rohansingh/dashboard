import React from "react";
import { TrashcanIcon } from "@primer/octicons-react";

export default function MemberPreview(props) {
	const { member, onDelete } = props;
	if (!member) return <div>Invalid member</div>;

	function handleDelete() {
		if (window.confirm(`Are you sure you want to remove ${member.name} from this node?`) && onDelete) {
			onDelete(member)
		}
	}

	return (
		<div className="pv2 bb b--light-gray flex justify-between items-center show-on-hover">
			<div>
				<div className="mb1">
					<span className="fw5">{member.name}</span>
				</div>
				<div className="mid-gray">
					<span>{member.email}</span>
				</div>
			</div>

			<div className="show-on-hover--content mr2">
				<button className="button-reset input-reset pa0 ma0 bn bg-transparent pointer" onClick={handleDelete}>
					<TrashcanIcon className="gray" />
				</button>
			</div>
		</div>
	);
}
