import React, { useState, useEffect } from "react";
import { useAuth0 } from "./Auth0";

import { fetchResource } from "../api";

import ResourceEdit from "./ResourceEdit";
import MemberPreview from "./MemberPreview";
import BuildingPreview from "./BuildingPreview";
import Status from "./Status";
import Panos from "./Panos";

export default function Request(props) {
	const [request, setRequest] = useState();
	const [editing, setEditing] = useState(false);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState();
	const { isAuthenticated, getTokenSilently } = useAuth0();

	const { id } = props;

	// alert(id);

	useEffect(() => {
		async function fetchData() {
			if (!id) return;
			try {
				setLoading(true);
				const token = await getTokenSilently();
				const resource = await fetchResource(`requests/${id}`, token);
				setRequest(resource);
				setLoading(false);
			} catch (error) {
				setError(error);
				setLoading(false);
			}
		}
		if (!isAuthenticated) return;
		fetchData();
	}, [isAuthenticated, getTokenSilently, id]);

	if (!id) return null;

	if (loading) {
		return (
			<div className="flex justify-center ph3 pv4">
				<div className="loading-ring"></div>
			</div>
		);
	}

	if (error) {
		return <div className="w-100">Error</div>;
	}

	const createDate = new Date(request.create_date).toLocaleDateString({
		weekday: "long",
		year: "numeric",
		month: "long",
		day: "numeric",
	});

	return (
		<div className="w-100 pa3 f6">
			<div className="flex flex-wrap items-center">
				<span className="f3 fw7">{`Request ${request.id}`}</span>{" "}
				<span className="ml2">
					<Status status={request.status} />
				</span>
			</div>
			<div className="flex mt2"></div>

			<div className="mt3">
				<div>
					<div className="mb1">
						<span className="mid-gray">Created</span>
					</div>
					<div>
						<span className="fw6 dark-gray">{createDate}</span>
					</div>
				</div>
			</div>

			<Section title="Details" onEdit={() => setEditing(true)}>
				{request.name && <Field name="name" value={request.name} />}
				<Field name="status" value={request.status} />
				<Field name="apartment" value={request.apartment} />
				<Field name="notes" value={request.notes} />
			</Section>
			<Section title="Building" onEdit={() => setEditing("building")}>
				<BuildingPreview building={request.building} />
			</Section>
			<Section title="Members" onEdit={() => setEditing(true)}>
				<MemberPreview member={request.member} />
			</Section>
			<Section
				title="Panoramas"
				editLabel="Add"
				onEdit={() => setEditing(true)}
			>
				<Panos panos={request.panoramas} />
			</Section>
			{editing && (
				<ResourceEdit
					resourceType="request"
					resource={request}
					fields={[
						{
							key: "status",
							type: "select",
							options: ["open", "closed"],
						},
						{ key: "apartment", type: "text" },
						{ key: "notes", type: "textarea" },
					]}
					onSubmit={async (nodePatch) => {
						// const token = await getTokenSilently();
						// alert("??");
						// await updateResource(
						// 	"nodes",
						// 	node.id,
						// 	nodePatch,
						// 	token
						// );
						// const resource = await fetchResource(
						// 	`nodes/${id}`,
						// 	token
						// );
						// setNode(resource);
						// setEditing(false);
					}}
					onCancel={() => setEditing(false)}
				/>
			)}
		</div>
	);
}

function Section(props) {
	return (
		<div className="mt3">
			<div className="pv3 flex item-center justify-between bb b--light-gray">
				<span className="f5 fw7">{props.title}</span>
				<button
					className="bn pa0 bg-transparent purple pointer fw5"
					onClick={() => props.onEdit(true)}
				>
					Edit
				</button>
			</div>
			{props.children}
		</div>
	);
}

function Field(props) {
	return (
		<div className="mv2">
			<div className="w4 mb1" style={{ minWidth: "8rem" }}>
				<span className="mid-gray ttc">{props.name}</span>
			</div>
			<span className="dark-gray">
				{props.value || `No ${props.name}`}
			</span>
		</div>
	);
}
