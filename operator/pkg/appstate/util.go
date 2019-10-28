package appstate

import (
	"sort"

	"github.com/replicatedhq/kotsadm/operator/pkg/appstate/types"
)

func normalizeStatusInformers(informers []types.StatusInformer, defaultNamespace string) (next []types.StatusInformer) {
	for _, informer := range informers {
		informer.Kind = getResourceKindCommonName(informer.Kind)
		if informer.Namespace == "" {
			informer.Namespace = defaultNamespace
		}
		next = append(next, informer)
	}
	return
}

func filterStatusInformersByResourceKind(informers []types.StatusInformer, kind string) (next []types.StatusInformer) {
	for _, informer := range informers {
		if informer.Kind == kind {
			next = append(next, informer)
		}
	}
	return
}

func buildAppStatusFromStatusInformers(informers []types.StatusInformer) (appStatus types.AppStatus) {
	for _, informer := range informers {
		appStatus = append(appStatus, types.ResourceState{
			Kind:      informer.Kind,
			Name:      informer.Name,
			Namespace: informer.Namespace,
			State:     types.StateMissing,
		})
	}
	sort.Sort(appStatus)
	return
}

func appStatusApplyNewResourceState(appStatus types.AppStatus, informers []types.StatusInformer, resourceState types.ResourceState) (next types.AppStatus, didChange bool) {
	for _, r := range appStatus {
		if resourceState.Kind == r.Kind &&
			resourceState.Namespace == r.Namespace &&
			resourceState.Name == r.Name &&
			resourceState.State != r.State {
			didChange = true
			next = append(next, resourceState)
		} else {
			next = append(next, r)
		}
	}
	sort.Sort(next)
	return
}