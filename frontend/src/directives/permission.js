import {useConunterStore} from "@/store";

const permission = {
  mounted(el, binding) {
    const {value} = binding;
    console.log("value", value);

    if (!value) return;

    const counterStore = useConunterStore();
    console.log("counterStore", counterStore.user);
    if (!counterStore.user.includes(value)) {
      el.parentNode && el.parentNode.removeChild(el);
    }
  },
};

export default permission;
