import { fetchMyDepartment, fetchAllDepartments } from '~/services/department'
import { DEPARTMENT_DATA, type DepartmentStaticData } from '~/data/departments'
import type { MyDepartmentResponse, DepartmentDetail } from '~/types/department'

export function useDepartmentView() {
  const myDepartment = useState<MyDepartmentResponse | null>('church-my-department', () => null)
  const myLoading = ref(false)
  const myError = ref<string | null>(null)

  const allDepartments = useState<DepartmentDetail[] | null>('church-all-departments', () => null)
  const allLoading = ref(false)
  const allError = ref<string | null>(null)

  const { userId } = useUserIdentity()

  const departments = computed<DepartmentStaticData[]>(() =>
    Object.values(DEPARTMENT_DATA),
  )

  async function loadMy(force = false) {
    if (myDepartment.value && !force) return myDepartment.value
    const id = userId.value
    if (!id) return null
    myLoading.value = true
    myError.value = null
    try {
      const resp = await fetchMyDepartment(id)
      myDepartment.value = resp
      return resp
    } catch (e) {
      myError.value = e instanceof Error ? e.message : '加载失败'
      return null
    } finally {
      myLoading.value = false
    }
  }

  async function loadAll(force = false) {
    if (allDepartments.value && !force) return allDepartments.value
    allLoading.value = true
    allError.value = null
    try {
      const resp = await fetchAllDepartments()
      allDepartments.value = resp.departments
      return resp.departments
    } catch (e) {
      allError.value = e instanceof Error ? e.message : '加载失败'
      return null
    } finally {
      allLoading.value = false
    }
  }

  return { myDepartment, departments, myLoading, myError, loadMy, allDepartments, allLoading, allError, loadAll }
}

