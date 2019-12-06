import { Action } from "redux"

export enum EdgeHeightActions {
	SET_EDGE_HEIGHT = "SET_EDGE_HEIGHT"
}

export interface SetEdgeHeightAction extends Action {
	type: EdgeHeightActions.SET_EDGE_HEIGHT
	payload: number
}

export type EdgeHeightAction = SetEdgeHeightAction

export function setEdgeHeight(edgeHeight: number): EdgeHeightAction {
	return {
		type: EdgeHeightActions.SET_EDGE_HEIGHT,
		payload: edgeHeight
	}
}