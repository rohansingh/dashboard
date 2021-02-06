import React, { useState, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import DocumentTitle from "react-document-title";
import { Link } from "react-router-dom";

import {
	fetchResource,
	updateResource,
	destroyResource,
	createMembership,
	RequestError,
} from "../../api";

import ResourceEdit from "../Resource/ResourceEdit";
import ResourceSection from "../Resource/ResourceSection";
import MemberPreview from "../Member/MemberPreview";
import MemberSelect from "../Member/MemberSelect";
import DevicePreview from "../Device/DevicePreview";
import PanoramaPreview from "../Panorama/PanoramaPreview";
import PanoramaAdd from "../Panorama/PanoramaAdd";
import Status from "../Status";
import Field from "../Field";

export default function Node({ id }) {
	const [node, setNode] = useState();
	const [editing, setEditing] = useState();
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState();
	const { isAuthenticated, getAccessTokenSilently } = useAuth0();

	useEffect(() => {
		async function fetchData() {
			if (!id) return;
			try {
				setLoading(true);
				setError();
				const token = isAuthenticated ? await getAccessTokenSilently() : null;
				const resource = await fetchResource(`nodes/${id}`, token);
				setNode(resource);
				setLoading(false);
			} catch (error) {
				setError(error);
				setLoading(false);
			}
		}
		fetchData();
	}, [isAuthenticated, getAccessTokenSilently, id]);

	async function addMember(memberId) {
		const token = await getAccessTokenSilently();

		let newNode;
		try {
			newNode = await createMembership(node, memberId, token);
		} catch (e) {
			// If we're adding a member who's already been added in
			// another window, just reload the node.
			if (e instanceof RequestError && e.response.status === 422) {
				newNode = await fetchResource(`nodes/${node.id}`, token);
			} else {
				throw e;
			}
		}

		setNode(newNode);
		setEditing(false);
	}

	async function removeMember(member) {
		const token = await getAccessTokenSilently();

		try {
			await destroyResource("memberships", member.membership_id, token);
		} catch (e) {
			// If we get a 404, we assume that the member was deleted in
			// another window, and we remove them from the node locally.
			if (!(e instanceof RequestError) || e.response.status !== 404) {
				throw e;
			}
		}

		setNode({
			...node,
			members: node.members.filter((m) => m.id !== member.id),
		});
	}

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

	const localizedInstallDate = new Date(node.create_date).toLocaleDateString(
		undefined,
		{
			weekday: "long",
			year: "numeric",
			month: "long",
			day: "numeric",
		}
	);

	const localizedAbandonDate = new Date(node.abandon_date).toLocaleDateString(
		undefined,
		{
			weekday: "long",
			year: "numeric",
			month: "long",
			day: "numeric",
		}
	);

	return (
		<DocumentTitle
			title={`${node.name ? node.name : `Node ${node.id}`} - NYC Mesh`}
		>
			<div className="w-100 pa3 f6">
				<div className="">
					<span className="f3 fw7">
						{node.name ? node.name : `Node ${node.id}`}
					</span>
				</div>
				<div className="mt2 flex">
					<span className="mid-gray f5 mr2">Node {node.id}</span>
					<Status status={node.status} />
				</div>
				<ResourceSection
					title="Details"
					disableEdit={!isAuthenticated}
					onEdit={() => setEditing("node")}
				>
					{node.name && <Field name="name" value={node.name} />}
					{isAuthenticated && (
						<Field
							name="building"
							value={node.building.address}
							url={`/map/buildings/${node.building.id}`}
						/>
					)}
					{isAuthenticated && (
						<Field name="installed" value={localizedInstallDate} />
					)}
					{node.abandon_date && (
						<Field name="deactivated" value={localizedAbandonDate} />
					)}
					<Field name="notes" value={node.notes} />
				</ResourceSection>
				<ResourceSection
					title="Panoramas"
					editLabel="Add"
					disableEdit={!isAuthenticated}
					onEdit={async () => {
						await setEditing(); // hack to rerun PanoramaAdd effect
						setEditing("panoramas");
					}}
				>
					<PanoramaPreview panoramas={node.panoramas} />
				</ResourceSection>
				{isAuthenticated && (
					<ResourceSection
						title="Members"
						editLabel="Add"
						onEdit={() => setEditing("members")}
					>
						{!node.members || !node.members.length ? (
							<div className="pv3">
								<span className="light-silver">No members</span>
							</div>
						) : (
							node.members.map((member) => (
								<MemberPreview
									key={member.id}
									member={member}
									onDelete={removeMember}
								/>
							))
						)}
					</ResourceSection>
				)}
				<ResourceSection
					title="Devices"
					editLabel="Add"
					disableEdit={!isAuthenticated}
					onEdit={() => setEditing(true)}
				>
					{node.devices.map((device) => (
						<Link
							key={device.id}
							to={`/map/devices/${device.id}`}
							className="link"
						>
							<DevicePreview device={device} />
						</Link>
					))}
				</ResourceSection>
				{editing === "node" && (
					<ResourceEdit
						resourceType="node"
						resource={node}
						fields={[
							{ key: "name", type: "text" },
							{
								key: "status",
								type: "select",
								options: ["active", "inactive", "potential"],
							},
							{ key: "notes", type: "textarea" },
						]}
						onSubmit={async (nodePatch) => {
							const token = await getAccessTokenSilently();
							await updateResource("nodes", node.id, nodePatch, token);
							const resource = await fetchResource(`nodes/${id}`, token);
							setNode(resource);
							setEditing(false);
						}}
						onCancel={() => setEditing(false)}
					/>
				)}
				{editing === "panoramas" && (
					<PanoramaAdd
						id={node.id}
						type="node"
						onUploaded={(newImages) => {
							setNode({
								...node,
								panoramas: [...newImages, ...node.panoramas],
							});
							setEditing();
						}}
						onError={(error) => {
							alert(error.message);
							setEditing();
						}}
					/>
				)}
				{editing === "members" && (
					<MemberSelect
						onSubmit={addMember}
						onCancel={() => setEditing(false)}
						existingMembers={node.members}
					/>
				)}
			</div>
		</DocumentTitle>
	);
}
