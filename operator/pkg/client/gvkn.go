package client

import (
	"crypto/sha256"
	"fmt"

	"github.com/pkg/errors"
	"gopkg.in/yaml.v2"
	corev1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	k8sschema "k8s.io/apimachinery/pkg/runtime/schema"
	"k8s.io/client-go/kubernetes"
	"sigs.k8s.io/controller-runtime/pkg/client/config"
)

type OverlySimpleGVKWithName struct {
	APIVersion string               `yaml:"apiVersion"`
	Kind       string               `yaml:"kind"`
	Metadata   OverlySimpleMetadata `yaml:"metadata"`
}

type OverlySimpleMetadata struct {
	Name      string `yaml:"name"`
	Namespace string `yaml:"namespace"`
}

func GetGVKWithName(content []byte) string {
	o := OverlySimpleGVKWithName{}

	if err := yaml.Unmarshal(content, &o); err != nil {
		return ""
	}

	h := sha256.New()
	h.Write([]byte(fmt.Sprintf("%s-%s-%s", o.APIVersion, o.Kind, o.Metadata.Name)))
	return fmt.Sprintf("%x", h.Sum(nil))
}

func IsCRD(content []byte) bool {
	o := OverlySimpleGVKWithName{}

	if err := yaml.Unmarshal(content, &o); err != nil {
		return false
	}

	return o.APIVersion == "apiextensions.k8s.io/v1beta1" && o.Kind == "CustomResourceDefinition"
}

func findPodsByOwner(name string, namespace string, gvk *k8sschema.GroupVersionKind) ([]*corev1.Pod, error) {
	cfg, err := config.GetConfig()
	if err != nil {
		return nil, errors.Wrap(err, "failed to get config")
	}

	clientset, err := kubernetes.NewForConfig(cfg)
	if err != nil {
		return nil, errors.Wrap(err, "failed to get client set")
	}

	pods, err := clientset.CoreV1().Pods(namespace).List(metav1.ListOptions{})
	if err != nil {
		return nil, errors.Wrap(err, "failed to list pods")
	}

	matchingPods := make([]*corev1.Pod, 0)
	for _, pod := range pods.Items {
		for _, owner := range pod.OwnerReferences {
			if owner.Name == name && owner.Kind == gvk.Kind && owner.APIVersion == gvk.GroupVersion().String() {
				matchingPods = append(matchingPods, pod.DeepCopy())
			}
		}
	}

	return matchingPods, nil
}

func findPodByName(name string, namespace string) (*corev1.Pod, error) {
	cfg, err := config.GetConfig()
	if err != nil {
		return nil, errors.Wrap(err, "failed to get config")
	}

	clientset, err := kubernetes.NewForConfig(cfg)
	if err != nil {
		return nil, errors.Wrap(err, "failed to get client set")
	}

	pod, err := clientset.CoreV1().Pods(namespace).Get(name, metav1.GetOptions{})
	if err != nil {
		return nil, errors.Wrap(err, "failed to get pod")
	}

	return pod, nil
}
