import * as Yup from 'yup'

export const stepOneSchema = (isTeamBased, requiredMembers) =>
	Yup.object({
		teamName: isTeamBased? Yup.string().trim().required('Team name is required'): Yup.string().trim(),
		selectedMembers: isTeamBased? Yup.array().of(Yup.object({ id: Yup.number().required() })).min(requiredMembers, `Select ${requiredMembers} teammate${requiredMembers > 1 ? 's' : ''}`): Yup.array().of(Yup.object({ id: Yup.number() })),
		teamLogo: Yup.mixed().nullable(),
	})

export const stepTwoSchema = (captainId) =>
	Yup.object({
		inGameNames: Yup.object().test('ign-required', 'Please enter in-game names for all team members', function (value) {
				const { selectedMembers = [] } = this.parent
				const ids = [captainId, ...selectedMembers.map((m) => m.id)]
				if (!value) return false
				return ids.every((id) => value[id] && String(value[id]).trim())
			})
			.required('In-game names are required'),
	})
