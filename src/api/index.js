export class RequestError extends Error {
	constructor(message, response) {
		super(message);
		this.response = response;
	}
}

export async function fetchResource(resource, token) {
	const path = `${process.env.REACT_APP_API_ROOT}/${resource}`;
	const options = {
		headers: {
			Authorization: `Bearer ${token}`,
		},
	};
	const res = await fetch(path, options);
	if (res.status !== 200) throw new RequestError(res.status, res.error);
	return res.json();
}

export async function createResource(resourceType, resource, token) {
	const path = `${process.env.REACT_APP_API_ROOT}/${resourceType}`;
	const options = {
		method: "POST",
		headers: {
			Authorization: `Bearer ${token}`,
			"Content-Type": "application/json",
		},
		body: JSON.stringify(resource),
	};
	const res = await fetch(path, options);
	if (res.status !== 200) throw new RequestError(res.error, res);
	return res.json();
}

export async function updateResource(
	resourceType,
	resourceId,
	resourcePatch,
	token
) {
	const path = `${process.env.REACT_APP_API_ROOT}/${resourceType}/${resourceId}`;
	const options = {
		method: "POST",
		headers: {
			Authorization: `Bearer ${token}`,
			"Content-Type": "application/json",
		},
		body: JSON.stringify(resourcePatch),
	};
	const res = await fetch(path, options);
	if (res.status !== 200) throw new RequestError(res.error, res);
	return res.json();
}

export async function destroyResource(resourceType, resourceId, token) {
	const path = `${process.env.REACT_APP_API_ROOT}/${resourceType}/${resourceId}`;
	const options = {
		method: "DELETE",
		headers: {
			Authorization: `Bearer ${token}`,
		},
	};

	const res = await fetch(path, options);
	if (res.status !== 200) throw new RequestError(res.error, res);
	return await res.json();
}

export async function search(query, token) {
	const path = `${process.env.REACT_APP_API_ROOT}/search?s=${query}`;
	const options = {
		headers: {
			Authorization: `Bearer ${token}`,
		},
	};
	const res = await fetch(path, options);
	if (res.status !== 200) throw new RequestError(res.error, res);
	return res.json();
}

export async function searchMembers(query, token) {
	const path = `${process.env.REACT_APP_API_ROOT}/members/search?s=${query}`;

	const options = {
		headers: {
			Authorization: `Bearer ${token}`,
		},
	};

	const res = await fetch(path, options);
	if (res.status !== 200) throw new RequestError(res.error, res);
	return res.json();
}

export async function searchDeviceTypes(query, token) {
	const path = `${process.env.REACT_APP_API_ROOT}/device_types/search?s=${query}`;

	const options = {
		headers: {
			Authorization: `Bearer ${token}`,
		},
	};

	const res = await fetch(path, options);
	if (res.status !== 200) throw new RequestError(res.error, res);
	return res.json();
}

export async function createDevice(device, token) {
	const path = `${process.env.REACT_APP_API_ROOT}/devices`;

	const options = {
		method: "POST",
		headers: {
			Authorization: `Bearer ${token}`,
			"Content-Type": "application/json",
		},
		body: JSON.stringify(device),
	};

	const res = await fetch(path, options);
	if (res.status !== 200) throw new RequestError(res.error, res);
	return await res.json();
}

export async function createMembership(node, memberId, token) {
	const path = `${process.env.REACT_APP_API_ROOT}/nodes/${node.id}/memberships`;

	const options = {
		method: "POST",
		headers: {
			Authorization: `Bearer ${token}`,
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ member_id: memberId }),
	};

	const res = await fetch(path, options);
	if (res.status !== 200) throw new RequestError(res.error, res);
	return await res.json();
}

export async function createLink(link, token) {
	const path = `${process.env.REACT_APP_API_ROOT}/links`;

	const options = {
		method: "POST",
		headers: {
			Authorization: `Bearer ${token}`,
			"Content-Type": "application/json",
		},
		body: JSON.stringify(link),
	};

	const res = await fetch(path, options);
	if (res.status !== 200) throw new RequestError(res.error, res);
	return await res.json();
}
